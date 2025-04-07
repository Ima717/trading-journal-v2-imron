import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, multiFactor, PhoneAuthProvider, RecaptchaVerifier } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaResolver, setMfaResolver] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        await auth.signOut();
        setError("Please verify your email before signing in.");
        return;
      }
      setUser(userCredential.user);
      navigate("/");
    } catch (err) {
      if (err.code === "auth/multi-factor-auth-required") {
        const resolver = multiFactor(auth.currentUser).getResolver(err);
        setMfaResolver(resolver);

        // Use the first MFA factor (assuming SMS)
        const phoneInfoOptions = {
          multiFactorHint: resolver.hints[0],
          session: resolver.session
        };

        const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
          size: 'invisible'
        }, auth);

        const phoneAuthProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
        setVerificationId(verificationId);
        setMfaRequired(true);
      } else {
        setError(err.message);
      }
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const credential = PhoneAuthProvider.credential(verificationId, mfaCode);
      const multiFactorAssertion = multiFactor.getMultiFactorAssertion(credential);
      const userCredential = await mfaResolver.resolveSignIn(multiFactorAssertion);
      setUser(userCredential.user);
      navigate("/");
    } catch (err) {
      setError("Invalid MFA code. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Sign In</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {!mfaRequired ? (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              className="w-full mb-3 px-3 py-2 border border-black rounded"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full mb-4 px-3 py-2 border rounded"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div id="recaptcha-container"></div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit}>
            <p className="text-sm mb-4">Enter the code sent to your phone:</p>
            <input
              type="text"
              placeholder="MFA Code"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="w-full mb-4 px-3 py-2 border rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Verify Code
            </button>
          </form>
        )}
        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600 underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
