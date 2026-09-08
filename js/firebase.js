const firebaseConfig = {
  apiKey: "AIzaSyDLdE4SDtgpU3ClkuEtEA4BYltbsjcvrCU",
  authDomain: "forgeai-cc574.firebaseapp.com",
  projectId: "forgeai-cc574",
  storageBucket: "forgeai-cc574.firebasestorage.app",
  messagingSenderId: "673205304143",
  appId: "1:673205304143:web:e4b2b9571ea2f62e9ea33a",
  measurementId: "G-K93PXJD1L5"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// ── Sync Helpers ─────────────────────────────────
async function syncToFirestore() {
  if (!window.currentUser) return;
  try {
    await db.collection('users').doc(window.currentUser.uid).set({
      context: state.context,
      projects: state.projects,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch(e) {
    console.warn("Error saving to Firestore", e);
  }
}

async function syncFromFirestore(uid) {
  try {
    const docRef = db.collection('users').doc(uid);
    const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data();
      if (data.context) state.context = data.context;
      if (data.projects) state.projects = data.projects;
    }
  } catch(e) {
    console.warn("Firestore sync failed:", e);
  }

  // Continue to check API key in app.js
  if (typeof checkApiKey === 'function') {
    checkApiKey();
  }
}
