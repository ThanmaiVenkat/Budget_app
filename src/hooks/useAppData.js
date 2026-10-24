import { useState, useEffect, useCallback, useRef } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { auth } from '../firebase';
import {
  ensureUserDoc,
  subscribeUser,
  subscribeHousehold,
  createHousehold as repoCreateHousehold,
  joinHousehold as repoJoinHousehold,
  updateHouseholdData,
  updatePersonalState
} from '../data/householdRepo';
import { getInitialDemoData } from '../utils/mockData';

// Firebase surfaces errors as codes like "auth/invalid-credential"; these are
// the ones a person can actually act on, phrased for them.
const AUTH_MESSAGES = {
  'auth/invalid-email': 'That email address looks invalid.',
  'auth/missing-password': 'Enter a password.',
  'auth/weak-password': 'Use a password of at least 6 characters.',
  'auth/email-already-in-use': 'An account already exists for that email — try signing in.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/user-not-found': 'No account found for that email.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/too-many-requests': 'Too many attempts — wait a moment and try again.',
  'auth/network-request-failed': 'Network problem — check your connection.',
  'auth/popup-closed-by-user': '',
  'auth/cancelled-popup-request': '',
  'auth/popup-blocked': 'Your browser blocked the sign-in popup — allow popups for this site and try again.',
  'auth/account-exists-with-different-credential': 'An account already exists for that email using a different sign-in method — try email and password instead.',
  'auth/internal-error': 'Google sign-in couldn\'t load — an ad blocker or privacy extension may be blocking Google\'s scripts. Try disabling it for this site, or use email and password instead.'
};
const friendlyAuthError = (e) => AUTH_MESSAGES[e?.code] || e?.message || 'Something went wrong.';

const describeDataError = (e) => {
  if (e?.code === 'permission-denied') {
    return "Can't reach your budget data — this usually means the Firestore security rules haven't been published yet. See README.md, \"Set up Firebase\" step 5.";
  }
  return e?.message || 'Something went wrong loading your data.';
};

export function useAppData() {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    return localStorage.getItem('tally_demo_mode') === 'true';
  });

  const [demoState, setDemoState] = useState(() => {
    try {
      const saved = localStorage.getItem('tally_demo_state');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback to initial
    }
    return getInitialDemoData();
  });

  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [userDoc, setUserDoc] = useState(null);
  const [household, setHousehold] = useState(null);
  const [householdReady, setHouseholdReady] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);
  const retry = useCallback(() => { setDataError(null); setRetryToken((n) => n + 1); }, []);

  const householdUnsubRef = useRef(null);

  const enableDemoMode = useCallback(() => {
    localStorage.setItem('tally_demo_mode', 'true');
    setIsDemoMode(true);
  }, []);

  const exitDemoMode = useCallback(() => {
    localStorage.removeItem('tally_demo_mode');
    setIsDemoMode(false);
  }, []);

  // Auth session → user document subscription.
  useEffect(() => {
    if (isDemoMode) {
      setAuthUser({ email: 'demo@tally.app', uid: 'demo-user-1', displayName: 'Demo Family' });
      setUserDoc(demoState.userDoc);
      setHousehold(demoState.household);
      setAuthReady(true);
      setHouseholdReady(true);
      return;
    }

    if (!auth) { setAuthReady(true); return; }
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      setAuthReady(true);
      if (!user) {
        setUserDoc(null);
        setHousehold(null);
        setHouseholdReady(false);
        setDataError(null);
      }
    });
    return unsub;
  }, [isDemoMode, demoState]);

  // Sync user doc from Firestore
  useEffect(() => {
    if (isDemoMode || !authUser) return;
    let unsub = null;
    let cancelled = false;
    (async () => {
      try {
        await ensureUserDoc(authUser.uid, authUser.email);
        if (cancelled) return;
        unsub = subscribeUser(
          authUser.uid,
          (data) => setUserDoc(data),
          (err) => { if (!cancelled) setDataError(describeDataError(err)); }
        );
      } catch (err) {
        if (!cancelled) setDataError(describeDataError(err));
      }
    })();
    return () => { cancelled = true; if (unsub) unsub(); };
  }, [authUser, retryToken, isDemoMode]);

  // Follow the household named by the user doc; re-subscribe if it changes.
  useEffect(() => {
    if (isDemoMode) return;
    const householdId = userDoc?.householdId || null;
    if (householdUnsubRef.current) { householdUnsubRef.current(); householdUnsubRef.current = null; }

    if (!householdId) {
      setHousehold(null);
      setHouseholdReady(Boolean(userDoc));
      return;
    }
    setHouseholdReady(false);
    householdUnsubRef.current = subscribeHousehold(
      householdId,
      (data) => { setHousehold(data); setHouseholdReady(true); },
      (err) => setDataError(describeDataError(err))
    );
    return () => { if (householdUnsubRef.current) { householdUnsubRef.current(); householdUnsubRef.current = null; } };
  }, [userDoc, retryToken, isDemoMode]);

  const signup = useCallback(async (email, password) => {
    try { await createUserWithEmailAndPassword(auth, email, password); }
    catch (e) { throw new Error(friendlyAuthError(e)); }
  }, []);

  const login = useCallback(async (email, password) => {
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch (e) { throw new Error(friendlyAuthError(e)); }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      if (e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') return;
      throw new Error(friendlyAuthError(e));
    }
  }, []);

  const logout = useCallback(() => {
    if (isDemoMode) {
      exitDemoMode();
      return Promise.resolve();
    }
    return signOut(auth);
  }, [isDemoMode, exitDemoMode]);

  const createHousehold = useCallback((name) => repoCreateHousehold(authUser.uid, name), [authUser]);
  const joinHousehold = useCallback((code) => repoJoinHousehold(authUser.uid, code), [authUser]);

  const householdId = userDoc?.householdId || null;
  const updateData = useCallback((patch) => {
    if (isDemoMode) {
      setDemoState((prev) => {
        const next = {
          ...prev,
          household: {
            ...prev.household,
            data: {
              ...prev.household.data,
              ...patch
            }
          }
        };
        try { localStorage.setItem('tally_demo_state', JSON.stringify(next)); } catch {}
        return next;
      });
      return Promise.resolve();
    }

    if (!householdId) return Promise.resolve();
    return updateHouseholdData(householdId, patch);
  }, [householdId, isDemoMode]);

  const updatePersonal = useCallback((personalState) => {
    if (isDemoMode) {
      setDemoState((prev) => {
        const next = {
          ...prev,
          userDoc: {
            ...prev.userDoc,
            personalState
          }
        };
        try { localStorage.setItem('tally_demo_state', JSON.stringify(next)); } catch {}
        return next;
      });
      return Promise.resolve();
    }

    if (!authUser) return Promise.resolve();
    return updatePersonalState(authUser.uid, personalState);
  }, [authUser, isDemoMode]);

  return {
    authUser: isDemoMode ? { email: 'demo@tally.app', uid: 'demo-user-1', displayName: 'Demo Family' } : authUser,
    authReady: isDemoMode ? true : authReady,
    userDoc: isDemoMode ? demoState.userDoc : userDoc,
    household: isDemoMode ? demoState.household : household,
    householdReady: isDemoMode ? true : householdReady,
    dataError: isDemoMode ? null : dataError,
    retry,
    data: (isDemoMode ? demoState.household?.data : household?.data) || null,
    personalState: (isDemoMode ? demoState.userDoc?.personalState : userDoc?.personalState) || null,
    joinCode: (isDemoMode ? demoState.household?.joinCode : (household?.joinCode || householdId)) || 'DEMO77',
    isDemoMode,
    enableDemoMode,
    exitDemoMode,
    signup,
    login,
    loginWithGoogle,
    logout,
    createHousehold,
    joinHousehold,
    updateData,
    updatePersonal
  };
}
