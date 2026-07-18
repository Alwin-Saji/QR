import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Supabase automatically picks up the access_token from the URL hash
  // and establishes a session. We just need to check if we have a session.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error('Invalid or expired reset link. Please request a new one.');
        navigate('/auth');
      }
    });
  }, [navigate]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      toast.success('Password updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-theme-4 text-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/40 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="bg-white/50 backdrop-blur-md max-w-md w-full rounded-[32px] p-8 sm:p-10 shadow-2xl border border-[#050505]/10 relative z-10">
        <h2 className="text-4xl font-heading font-black tracking-tighter text-[#050505] mb-8 text-center">
          Set New Password
        </h2>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label className="block text-[#050505]/80 mb-2 text-sm font-bold tracking-wide">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/40 border border-[#050505]/20 text-[#050505] placeholder:text-[#050505]/30 rounded-2xl px-5 py-4 focus:ring-0 focus:border-[#050505] outline-none transition-all font-light"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#050505] text-white py-4 rounded-full font-bold hover:bg-[#050505]/80 disabled:opacity-50 transition-colors mt-8 flex items-center justify-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
