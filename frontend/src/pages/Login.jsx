import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [error, setError] = useState(null);

  const { user, loading, login } = useContext(AuthContext);
  const navigate = useNavigate();


useEffect(() => {
  if (loading) return;

  if (user) {
    
    if (user.role === "seller") navigate("/seller");
    else if (user.role === "admin") navigate("/admin");
    else navigate("/dashboard");
  }
}, [user, loading, navigate]); // 
if (loading) return null;

  if (loading) return null; // 

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingBtn(true);
    setError(null);

    try {
     const res = await fetch(
            "http://localhost/Appzip/APPDEV/backend/index.php?action=login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          credentials: "include",
          body: new URLSearchParams({
            username: form.username,
            password: form.password,
          }),
        }
      );

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);

      if (data.success) {
        login(data.user);

if (data.user.role === "seller") navigate("/seller");
else if (data.user.role === "admin") navigate("/admin");
else navigate("/dashboard"); 
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Error during login");
    } finally {
      setLoadingBtn(false);
    }
  };


  return (
    <div className="select-none cursor-default h-screen flex flex-col items-center justify-center bg-white px-6 overflow-hidden">
      <div className="text-center mb-10 select-none">
        <h1 className="text-6xl font-fredoka font-extrabold " style={{
         WebkitTextStroke: "2px white",      // 
         textShadow: "0 0 8px white, 2px 2px 6px rgba(0,0,0,0.3)" //
           }}>
          <span className="text-orange-600 ">DU</span>
          <span className="text-orange-600">mKIN'</span>
        </h1>
        <h2 className="text-5xl font-extrabold text-pink-600"
         style={{
         WebkitTextStroke: "2px white",      // 
         textShadow: "0 0 8px white, 2px 2px 6px rgba(0,0,0,0.3)" //
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