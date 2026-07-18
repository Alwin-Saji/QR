import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user) return null;

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Registration successful! You can now log in.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Please enter your email first to reset password');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-theme-4 text-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/40 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="bg-white/50 backdrop-blur-md max-w-md w-full rounded-[32px] p-8 sm:p-10 shadow-2xl border border-[#050505]/10 relative z-10">
        <h2 className="text-5xl font-heading font-black tracking-tighter text-[#050505] mb-8 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-2xl mb-8 border border-red-500/20 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-[#050505]/80 mb-2 text-sm font-bold tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/40 border border-[#050505]/20 text-[#050505] placeholder:text-[#050505]/30 rounded-2xl px-5 py-4 focus:ring-0 focus:border-[#050505] outline-none transition-all font-light"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[#050505]/80 text-sm font-bold tracking-wide">Password</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="text-xs font-medium text-[#050505]/60 hover:text-[#050505] transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/40 border border-[#050505]/20 text-[#050505] placeholder:text-[#050505]/30 rounded-2xl px-5 py-4 pr-12 focus:ring-0 focus:border-[#050505] outline-none transition-all font-light"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#050505]/40 hover:text-[#050505]/80 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#050505] text-white py-4 rounded-full font-bold hover:bg-[#050505]/80 disabled:opacity-50 transition-colors mt-8 flex items-center justify-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#050505]/60 hover:text-[#050505] transition-colors font-medium text-sm"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
