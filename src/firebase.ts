import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// CareLink web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQKLhFq6lehIpxDNQ_wVYW6oIHMKUiOCs",
  authDomain: "healthcare-1850c.firebaseapp.com",
  projectId: "healthcare-1850c",
  storageBucket: "healthcare-1850c.firebasestorage.app",
  messagingSenderId: "937643523733",
  appId: "1:937643523733:web:40c614c7009dbd1e8ea59c",
  measurementId: "G-5G8WS7C5SS"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and export it
export const db = getFirestore(app);
