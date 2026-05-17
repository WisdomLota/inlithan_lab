import React, { useState } from "react";
import { register, login, logout } from "../api/auth";

export default function Auth() {
  const [user, setUser] = useState(null);

  const handleRegister = () => {
    register({ name: "John", email: "john@example.com", password: "1234", role: "student" })
      .then(setUser);
  };

  const handleLogin = () => {
    login({ email: "john@example.com", password: "1234" })
      .then(setUser);
  };

  const handleLogout = () => {
    logout().then(() => setUser(null));
  };

  return (
    <div>
      <h2>Auth</h2>
      {user ? (
        <div>
          <p>Logged in as {user.data?.name || "User"}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <>
          <button onClick={handleRegister}>Register</button>
          <button onClick={handleLogin}>Login</button>
        </>
      )}
    </div>
  );
}