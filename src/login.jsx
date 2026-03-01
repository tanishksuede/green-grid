import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export default function Login() {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Logged in as:", result.user.displayName);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button onClick={handleLogin}>
      Sign in with Google
    </button>
  );
}