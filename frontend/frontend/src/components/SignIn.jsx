import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  auth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "../firebase";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import {
  AuthContainer,
  FormContainer,
  InputField,
  SubmitButton,
  ErrorMessage,
  ResetLink,
  Title,
} from "../styles/AuthStyles";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Input validation
    if (!email || !email.trim()) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    if (!password || !password.trim()) {
      setError("Password is required");
      setIsLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const idToken = await userCredential.user.getIdToken();

      const response = await axios.post(
        getApiUrl(API_ENDPOINTS.AUTH.LOGIN),
        { idToken },
        { 
          headers: { "Content-Type": "application/json" },
          timeout: 10000 // 10 second timeout
        }
      );

      if (response.data.status === "success") {
        localStorage.setItem("authToken", idToken);
        localStorage.setItem("userRole", response.data.role);
        localStorage.setItem("userEmail", response.data.email);
        localStorage.setItem("userName", response.data.name);

        navigate(
          response.data.redirectUrl ||
            `/${response.data.role.toLowerCase()}/dashboard`
        );
      } else {
        setError(response.data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        // Server responded with error status
        setError(error.response.data?.message || "Login failed. Please check your credentials.");
      } else if (error.request) {
        // Request made but no response
        setError("Unable to connect to server. Please check your internet connection.");
      } else if (error.code === 'auth/user-not-found') {
        setError("No account found with this email address.");
      } else if (error.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (error.code === 'auth/invalid-email') {
        setError("Invalid email address format.");
      } else if (error.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError(error.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email || !email.trim()) {
      setError("Please enter your email address first");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setError("Password reset email sent. Please check your inbox.");
    } catch (resetError) {
      if (resetError.code === 'auth/user-not-found') {
        setError("No account found with this email address.");
      } else if (resetError.code === 'auth/invalid-email') {
        setError("Invalid email address format.");
      } else {
        setError("Failed to send reset email. Please try again later.");
      }
    }
  };

  return (
    <AuthContainer>
      <Title>Campus Cloud University</Title>
      <FormContainer onSubmit={handleSignIn}>
        <InputField
          type="email"
          placeholder="University Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <InputField
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </SubmitButton>
        <ResetLink onClick={handlePasswordReset}>Forgot Password?</ResetLink>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </FormContainer>
    </AuthContainer>
  );
};

export default SignIn;
