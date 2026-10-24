import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { DEFAULT_CATEGORIES } from '../utils/mockData';

// The shared budget state a whole household reads and writes. A join lands a
// new device on exactly this, live. Kept as one map on the household document
// so an update is atomic and a single listener drives the entire app.
const emptyHouseholdData = () => ({
  transactions: [],
  members: [],
  categories: DEFAULT_CATEGORIES,
  bills: [],
  enableRollover: true
});

// Per-user and private — the personal savings tracker is "mine", not the
// household's, so it lives on the user document rather than the shared one.
const emptyPersonalState = () => ({ salary: 0, goals: [], transactions: [] });

// Codes are read aloud and typed by hand, so the alphabet drops the glyphs
// that get confused (0/O, 1/I/L). Six chars is ~1 in 10^9 — collision handled
// on write regardless.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const makeJoinCode = () => {
  let out = '';
  for (let i = 0; i < 6; i++) out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return out;
};

export const ensureUserDoc = async (uid, email) => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { email: email || null, householdId: null, personalState: emptyPersonalState() });
  }
  return ref;
};

// onSnapshot's error callback is easy to forget entirely — without one, a
// listener that fails (most commonly permission-denied, from security rules
// that were never published) fails silently: no callback fires again, ever,
// and the caller is left waiting on data that will never arrive. Both
// subscriptions report failure through onError instead of swallowing it.
export const subscribeUser = (uid, cb, onError) => onSnapshot(
  doc(db, 'users', uid),
  (snap) => cb(snap.exists() ? snap.data() : null),
  onError
);

export const subscribeHousehold = (householdId, cb, onError) => onSnapshot(
  doc(db, 'households', householdId),
  (snap) => cb(snap.exists() ? snap.data() : null),
  onError
);

export const createHousehold = async (uid, name) => {
  // The household id *is* the join code, so join is a single direct write with
  // no lookup collection to keep in sync. Claiming a code is just creating its
  // document: the security rules allow a create only on an id that doesn't
  // exist yet, so a collision arrives as a failed write (treated as an update
  // to someone else's household) and we simply try another code. No read of
  // another household is ever needed, which keeps their data members-only.
  let lastErr = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeJoinCode();
    try {
      await setDoc(doc(db, 'households', code), {
        name: name || 'My Household',
        joinCode: code,
        ownerUid: uid,
        memberUids: [uid],
        createdAt: serverTimestamp(),
        data: emptyHouseholdData()
      });
      await updateDoc(doc(db, 'users', uid), { householdId: code });
      return { householdId: code, joinCode: code };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Could not create a household, please try again.');
};

export const joinHousehold = async (uid, rawCode) => {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) throw new Error('Enter a household code.');

  // Deliberately no read first: the security rules keep household data
  // members-only, and reading to "check the code exists" would hand the
  // contents to anyone who guesses one. Appending the uid is the whole join —
  // the rules allow a non-member to add only themselves — and a bad code
  // surfaces as a failed write rather than a leaked document.
  try {
    await updateDoc(doc(db, 'households', code), { memberUids: arrayUnion(uid) });
  } catch {
    throw new Error("Couldn't join — check the household code and try again.");
  }
  await updateDoc(doc(db, 'users', uid), { householdId: code });
  return { householdId: code };
};

// Every shared-data mutation funnels through here: the caller computes the next
// value (same reducer logic the app already had) and it is written as a single
// dotted-field update, so unrelated parts of the document are untouched.
export const updateHouseholdData = (householdId, patch) => {
  const dotted = {};
  Object.entries(patch).forEach(([key, value]) => { dotted[`data.${key}`] = value; });
  return updateDoc(doc(db, 'households', householdId), dotted);
};

export const updatePersonalState = (uid, personalState) =>
  updateDoc(doc(db, 'users', uid), { personalState });

export { emptyHouseholdData, emptyPersonalState };
