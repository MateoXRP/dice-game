import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Submit score to Firestore
export async function submitGlobalScore(collectionName, name, score) {
  const ref = doc(db, collectionName, name);
  await setDoc(ref, {
    name,
    wins: score.wins,
    losses: score.losses,
  });
}

// Fetch leaderboard from Firestore
export async function fetchGlobalLeaderboard(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  const result = [];
  snapshot.forEach(doc => result.push(doc.data()));
  return result.sort((a, b) => (b.wins - b.losses) - (a.wins - a.losses));
}

export { db };

