// utils/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyCnCZ_i63jQ_A_10BmRwLBbzNhBJ24SL7w",
  authDomain: "pots-and-balances.firebaseapp.com",
  projectId: "pots-and-balances",
  storageBucket: "pots-and-balances.firebasestorage.app",
  messagingSenderId: "288489189235",
  appId: "1:288489189235:web:6e4e08213d02d8c866df06",
  measurementId: "G-4ZR6EX5J1N",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };
