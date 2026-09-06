// firebase-config.js

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
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
