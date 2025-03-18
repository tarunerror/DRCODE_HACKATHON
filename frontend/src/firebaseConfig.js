import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBqBaxywAt0fcquUZuA3DOaF9jtNG5aIl0",
    authDomain: "drcode-5d8ff.firebaseapp.com",
    projectId: "drcode-5d8ff",
    storageBucket: "drcode-5d8ff.firebasestorage.app",
    messagingSenderId: "761540195496",
    appId: "1:761540195496:web:d678b547a72235f8597e9d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
