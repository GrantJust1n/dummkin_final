import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "http://localhost/Appzip/APPDEV/backend/index.php?action=login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (data.type === "success") {
        login(data.user);
        navigate("/shop");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Error during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white px-6 overflow-hidden">
      <div className="text-center mb-10 select-none">
        <h1 className="text-6xl font-fredoka font-extrabold " style={{
         WebkitTextStroke: "2px white",      // white outline
         textShadow: "0 0 8px white, 2px 2px 6px rgba(0,0,0,0.3)" // glow + depth
           }}>
          <span className="text-orange-600 ">DU</span>
          <span className="text-orange-600">mKIN'</span>
        </h1>
        <h2 className="text-5xl font-extrabold text-pink-600"
         style={{
         WebkitTextStroke: "2px white",      // white outline
         textShadow: "0 0 8px white, 2px 2px 6px rgba(0,0,0,0.3)" // glow + depth
           }}>
          DONUTS
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5"
      >
        <div>
          <label className="block text-pink-900 font-semibold mb-1">
            Email Address
          </label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full p-3 rounded-full border-2 border-pink-300 focus:border-pink-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-pink-900 font-semibold mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 rounded-full border-2 border-pink-300 focus:border-pink-500 focus:outline-none"
            required
          />
        </div>

        {error && <p className="text-red-600 text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-full text-lg font-semibold shadow-md disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Logging in..." : "LOG IN"}
        </button>
      </form>

      <p className="mt-4 text-sm">
        Don't have an account? {" "}
        <a href="/register" className="text-pink-600 font-semibold">
          Sign up.
        </a>
      </p>

      <p className="mt-10 text-[10px] text-gray-500 text-center max-w-xs">
  This site is protected by reCAPTCHA and the 
  <a 
    href="https://policies.google.com/privacy" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="text-pink-600 underline ml-1"
  >
    Google Privacy Policy
  </a> 
  and 
  <a 
    href="https://policies.google.com/terms"
    target="_blank"
    rel="noopener noreferrer"
    className="text-pink-600 underline ml-1"
  >
    Terms of Service
  </a> 
  apply.
</p>

    </div>
  );
} 