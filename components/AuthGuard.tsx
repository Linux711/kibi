"use client";
import { useState, useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('project-journal-auth');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production, this would be server-side
    const correctPassword = 'journal2024'; // Change this to your desired password

    if (password === correctPassword) {
      localStorage.setItem('project-journal-auth', 'authenticated');
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('project-journal-auth');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#A9C3A1] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#A9C3A1] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-center mb-6 text-[#2B2B2B]">Project Journal</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2B2B2B] mb-2">
                Enter Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A9C3A1]"
                placeholder="Password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#A9C3A1] text-white py-2 px-4 rounded hover:bg-[#95B58C] transition"
            >
              Login
            </button>
          </form>
          <div className="mt-4 text-sm text-gray-600 text-center">
            Default password: journal2024
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[#A9C3A1] p-4 flex justify-end">
        <button
          onClick={handleLogout}
          className="bg-white text-[#2B2B2B] px-4 py-2 rounded hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>
      {children}
    </div>
  );
}