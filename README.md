# Tally

A household budget tracker: shared expenses, bills, category budgets, and a
per-person savings tracker. Installable as a PWA on Android/iOS. Data syncs
across every device signed into the same household via Firebase.

## Set up Firebase

The app needs a Firebase project of your own — this can't be provisioned for
you, since it requires your Google account. It takes about five minutes.

1. **Create a project.** Go to [console.firebase.google.com](https://console.firebase.google.com) → *Add project*. Google Analytics is not needed; you can skip it.
2. **Register a Web app.** In the project overview, click the `</>` icon → give it any nickname → *Register app*. You'll land on a screen showing a `firebaseConfig` object — keep this tab open, you'll need six values off it in a moment.
3. **Enable Authentication.** Left sidebar → *Build* → *Authentication* → *Get started* → under *Sign-in method*, enable **Email/Password**.
4. **Enable Firestore.** Left sidebar → *Build* → *Firestore Database* → *Create database* → any region close to your family → **Start in production mode** (the app ships its own security rules, below — production mode just means "don't use the wide-open test rules").
5. **Publish the security rules.** Easiest via the CLI from this repo:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add        # pick the project you just created
   firebase deploy --only firestore:rules
   ```
   Without your own login this can't be done for you — `firestore.rules` in this repo is the file that gets published; review it before you do.

## Configure the app

Take the six values from the `firebaseConfig` object in step 2 above and put
them in `.env.local` for local development:

```bash
cp .env.example .env.local
# then fill in the VITE_FIREBASE_* values
```

For the GitHub Pages deploy, add the same six values as **repository
secrets** instead (Settings → Secrets and variables → Actions → *New
repository secret*, one per value, same names as in `.env.example`) —
`deploy.yml` reads them from there at build time and bakes them into the
deployed bundle. `FirebaseNotConfigured.jsx` is what a visitor sees if this
step is skipped, rather than a blank page.

These values are not secret in the way an API key normally is — Firebase's
own docs are explicit that they're meant to be embedded in a public client
bundle, and access control comes entirely from the security rules, not from
hiding this config. Keeping them out of the repo is still good practice; it's
just not the security boundary.

## How data is shared

Each person creates their own account (email + password) and either creates
a household (gets a 6-character code to share) or joins one with a code a
family member gives them. Everyone in a household sees the same transactions,
bills, and budgets, synced in real time via Firestore. The personal savings
tracker is private to each signed-in person, not shared with the household.

## Local development

```bash
npm install
npm run dev
```

To develop against a local Firebase backend instead of your real project (no
real credentials needed, and safe to experiment with):

```bash
npm install -g firebase-tools
firebase emulators:start --only auth,firestore
# in another terminal, with VITE_USE_EMULATOR=1 in .env.local:
npm run dev
```

## Deploying

Push to `main` — `.github/workflows/deploy.yml` builds and publishes to
GitHub Pages automatically (Settings → Pages → Source → GitHub Actions must
be set once, first time only).
