import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  auth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "../firebase";
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

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();

      const response = await axios.post(
        "http://localhost:8080/auth/login",
        { idToken },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status === "success") {
        localStorage.setItem("authToken", idToken);
        localStorage.setItem("userRole", response.data.role);
        localStorage.setItem("userEmail", response.data.email);
        localStorage.setItem("userName", response.data.name);

        navigate(
          response.data.redirectUrl ||
            `/${response.data.role.toLowerCase}/dashboard`
        );
      }
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset email sent. Please check your inbox.");
    } catch (resetError) {
      setError("Failed to send reset email. Please try again later.");
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
