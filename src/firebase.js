import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyATDCoHnoWCgIUgVY34aH-6WVisdutuJR8",
    authDomain: "greengrid-941dc.firebaseapp.com",
    projectId: "greengrid-941dc",
    storageBucket: "greengrid-941dc.firebasestorage.app",
    messagingSenderId: "897765385847",
    appId: "1:897765385847:web:7533ef974a1a718a248872"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();