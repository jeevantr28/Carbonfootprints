import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 animate-fade-in-up">
      <div className="glass-panel w-full max-w-md p-8">
        <header className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00FFB2] mb-2 text-glow-mint">
            NEW OPERATOR
          </h2>
          <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Establish credentials</p>
        </header>

        {error && (
          <div className="bg-[#FF4C6A]/20 border border-[#FF4C6A]/50 text-[#FF4C6A] p-3 rounded-lg mb-6 text-sm font-mono text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-xs font-mono tracking-widest text-gray-400 mb-2 uppercase">Alias</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass-input font-mono py-3 px-4"
              placeholder="Commander Jane"
            />
          </div>

          <div>
            <label className="block text-xs font-mono tracking-widest text-gray-400 mb-2 uppercase">Cred: Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full glass-input font-mono py-3 px-4"
              placeholder="operator@echobase.net"
            />
          </div>
          
          <div>
            <label className="block text-xs font-mono tracking-widest text-gray-400 mb-2 uppercase">Cred: Passcode</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full glass-input font-mono py-3 px-4"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative group overflow-hidden rounded-xl p-[1px] mt-4"
          >
            <span className="absolute inset-0 bg-[#00FFB2] opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-[#050810] rounded-xl px-6 py-3 flex items-center justify-center transition-all group-hover:bg-opacity-50">
              <span className="font-mono font-bold tracking-widest uppercase text-white">
                {loading ? 'Processing...' : 'Create Record'}
              </span>
            </div>
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 font-mono text-xs uppercase tracking-widest">
          Existing operator? <Link to="/login" className="text-[#00FFB2] hover:underline text-glow-mint">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
