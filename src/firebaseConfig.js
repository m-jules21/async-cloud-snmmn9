// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Importation de getAuth pour obtenir l'objet auth
import { getFirestore } from "firebase/firestore"; // Si tu utilises Firestore

const firebaseConfig = {
  apiKey: "AIzaSyBWkg6pmUj_z7-ne8lud3fyPadXkkpYNNc",
  authDomain: "space-review-v4.firebaseapp.com",
  projectId: "space-review-v4",
  storageBucket: "space-review-v4.firebasestorage.app",
  messagingSenderId: "1026718549101",
  appId: "1:1026718549101:web:e8d514de26a0baf1322b64",
  measurementId: "G-Z5NC2X2QT0",
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Récupération de l'authentification et Firestore
export const auth = getAuth(app); // On exporte 'auth' pour l'utiliser dans l'app
export const db = getFirestore(app); // Si tu utilises Firestore
