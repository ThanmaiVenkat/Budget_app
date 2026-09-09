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
  'auth/account-exists-with-different-credential': 'An account already exists for that email using a different sign-in method — try email and password instead.'
};
const friendlyAuthError = (e) => AUTH_MESSAGES[e?.code] || e?.message || 'Something went wrong.';

// A failure here almost always means the Firestore security rules haven't
// been published yet (see README "Set up Firebase" step 5) — the project and
// its config can be entirely correct and this still happens, since Firestore
// defaults to denying everything until firestore.rules is deployed. Worth
// naming specifically rather than a generic "something went wrong": it's the
// most likely gap for anyone following the setup steps out of order.
const describeDataError = (e) => {
  if (e?.code === 'permission-denied') {
    return "Can't reach your budget data — this usually means the Firestore security rules haven't been published yet. See README.md, \"Set up Firebase\" step 5.";
  }
  return e?.message || 'Something went wrong loading your data.';
};

// Single source of truth for auth + synced data. Drives the whole app: which
// screen shows (loading / signed-out / no-household / ready) and the live
// household data every tab reads.
export function useAppData() {
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [userDoc, setUserDoc] = useState(null);
  const [household, setHousehold] = useState(null);
  const [householdReady, setHouseholdReady] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);
  const retry = useCallback(() => { setDataError(null); setRetryToken((n) => n + 1); }, []);

  const householdUnsubRef = useRef(null);

  // Auth session → user document subscription.
  useEffect(() => {
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
  }, []);

  // Once signed in, make sure the user doc exists, then follow it live. Both
  // steps can fail — most likely on unpublished security rules — and that
  // failure is reported through dataError rather than left to hang the
  // loading screen forever or vanish as an unhandled rejection.
  useEffect(() => {
    if (!authUser) return;
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
  }, [authUser, retryToken]);

  // Follow the household named by the user doc; re-subscribe if it changes.
  useEffect(() => {
    const householdId = userDoc?.householdId || null;
    if (householdUnsubRef.current) { householdUnsubRef.current(); householdUnsubRef.current = null; }

    if (!householdId) {
      setHousehold(null);
      setHouseholdReady(Boolean(userDoc)); // user doc loaded, simply no household yet
      return;
    }
    setHouseholdReady(false);
    householdUnsubRef.current = subscribeHousehold(
      householdId,
      (data) => { setHousehold(data); setHouseholdReady(true); },
      (err) => setDataError(describeDataError(err))
    );
    return () => { if (householdUnsubRef.current) { householdUnsubRef.current(); householdUnsubRef.current = null; } };
  }, [userDoc, retryToken]);

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
      // Closing the picker isn't an error worth surfacing — the person just
      // changed their mind, so leave them back on the sign-in screen quietly.
      if (e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') return;
      throw new Error(friendlyAuthError(e));
    }
  }, []);

  const logout = useCallback(() => signOut(auth), []);

  const createHousehold = useCallback((name) => repoCreateHousehold(authUser.uid, name), [authUser]);
  const joinHousehold = useCallback((code) => repoJoinHousehold(authUser.uid, code), [authUser]);

  const householdId = userDoc?.householdId || null;
  const updateData = useCallback((patch) => {
    if (!householdId) return Promise.resolve();
    return updateHouseholdData(householdId, patch);
  }, [householdId]);

  const updatePersonal = useCallback((personalState) => {
    if (!authUser) return Promise.resolve();
    return updatePersonalState(authUser.uid, personalState);
  }, [authUser]);

  return {
    authUser,
    authReady,
    userDoc,
    household,
    householdReady,
    dataError,
    retry,
    data: household?.data || null,
    personalState: userDoc?.personalState || null,
    joinCode: household?.joinCode || householdId,
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
