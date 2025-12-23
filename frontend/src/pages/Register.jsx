import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import dunkinCup from '../assets/dunkin-cup.png';


const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
   
 
 
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user])
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost/Appzip/APPDEV/backend/index.php?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.type === 'success') {
        alert('Registration successful! Please login.');
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Error during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="select-none cursor-default h-screen flex flex-col items-center justify-center bg-white px-6 overflow-hidden">
      <div className="flex flex-col md:flex-row w-full max-w-6xl shadow-lg">
        {/* Left Side - Logo */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-white p-8">
          <div className="text-center mb-50">
            <img src={dunkinCup} alt="Dunkin Cup" className="mb-4 w-24 h-auto ml-1 " />
            <div className="mb-10">
            <h1 className="text-5xl font-extrabold text-orange-500">
              DUmKIN’
            </h1>
            <h2 className="text-5xl font-extrabold text-pink-600">
              DONUTS
            </h2>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white p-10 md:p-16">
          <h1 className="text-2xl md:text-3xl font-bold text-pink-600">
            In busy daily <br /> lives, <span className="text-orange-500">DUmKIN’</span>
          </h1>
          <p className="mt-2 text-gray-600">
            will be a sweet friend to you.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block mb-1 text-gray-700">Full Name</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full p-3 border border-pink-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-700">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 border border-pink-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-3 border border-pink-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-3 rounded-full font-bold hover:bg-pink-700 transition duration-200"
              disabled={loading}
            >
              {loading ? 'Signing Up...' : 'SIGN UP'}
            </button>
          </form>

          <p className="mt-6 text-gray-500 text-sm">
            By signing up, you agree to the{' '}
            <a href="#" className="underline">Terms of Service</a> and{' '}
            <a href="#" className="underline">Privacy Policy</a>, including{' '}
            <a href="#" className="underline">Cookie Use</a>.
          </p>

          <p className="mt-4 text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-pink-600 font-semibold">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
