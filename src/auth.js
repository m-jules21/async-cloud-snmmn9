// auth.js
import {
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
const auth = getAuth();

// Fonction de connexion
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Si l'utilisateur n'a pas de displayName, on lui en attribue un par défaut
    if (!user.displayName) {
      await updateProfile(user, {
        displayName: user.email.split("@")[0], // Utilise l'email avant '@' comme nom
      });
    }
  } catch (error) {
    console.error("Erreur de connexion : ", error.message);
    throw error;
  }
};
