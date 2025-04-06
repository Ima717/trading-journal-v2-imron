import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // For success message
  const navigate = useNavigate();
  const { setUser } = useAuth(); // Integrate with AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await userCredential.user.sendEmailVerification(); // Send verification email
      setUser(userCredential.user); // Update context
      setMessage("Account created! Please check your email to verify your account.");
      // Optionally sign out to enforce verification
      await auth.signOut();
      setUser(null);
      // Uncomment the next line if you want to redirect to sign-in instead of staying on sign-up page
      // navigate("/signin");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Create Account</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-3 px-3 py-2 border border-black rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 px-3 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Sign Up
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <a href="/signin" className="text-blue-600 underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
