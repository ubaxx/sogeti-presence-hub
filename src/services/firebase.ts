import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // 🔥 DENNA RAD VAR PROBLEMET

const firebaseConfig = {
  apiKey: "AIzaSyCsJTUv0g64lpHOpcuGs1dD5SjI6sdlrn8",
  authDomain: "sogeti-presence-hub.firebaseapp.com",
  projectId: "sogeti-presence-hub",
  storageBucket: "sogeti-presence-hub.firebasestorage.app",
  messagingSenderId: "713835192967",
  appId: "1:713835192967:web:ccb37b7e1650c1f9ca8e22",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);