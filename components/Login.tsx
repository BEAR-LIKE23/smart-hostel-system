import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Login: React.FC = () => {
  const [view, setView] = useState<'signin' | 'signup' | 'verify_otp' | 'forgot_password'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const [otp, setOtp] = useState('');

  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (view === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              name,
              level,
              gender,
            }
          }
        });

        if (signUpError) throw signUpError;
        
        setView('verify_otp');
        setResendCooldown(60);

      } else { // 'signin'
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'signup'
        });
        if (error) throw error;
    } catch(err: any) {
        setError(err.error_description || err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        });
        if (error) throw error;
        setMessage("A new verification code has been sent.");
        setResendCooldown(60);
    } catch(err: any) {
        setError(err.error_description || err.message);
    } finally {
        setLoading(false);
    }
  };
  
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage("Password reset instructions have been sent to your email.");
    } catch(err: any) {
        setError(err.error_description || err.message);
    } finally {
        setLoading(false);
    }
  };


  const switchView = (newView: typeof view) => {
    setView(newView);
    setError(null);
    setMessage(null);
    setPassword('');
    setOtp('');
    if (newView === 'signup') {
        setName('');
        setLevel('');
        setGender('Male');
    }
  };

  if (view === 'verify_otp') {
    return (
       <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">Check Your Email</h1>
                <p className="mt-2 text-gray-500">We've sent a 6-digit verification code to <strong className="font-medium">{email}</strong>.</p>
            </div>
            <form className="mt-8 space-y-4" onSubmit={handleVerifyOtp}>
                <input 
                    name="otp" 
                    type="text" 
                    required 
                    className="appearance-none text-center tracking-[1em] relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-lg" 
                    placeholder="______" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    maxLength={6}
                />
                 {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                 {message && <p className="text-sm text-green-600 text-center">{message}</p>}
                <div>
                    <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:bg-amber-300">
                        {loading ? 'Verifying...' : 'Verify Account'}
                    </button>
                </div>
            </form>
             <div className="text-center text-sm space-y-2">
                <button 
                    onClick={handleResendOtp} 
                    disabled={resendCooldown > 0 || loading}
                    className="font-medium text-amber-600 hover:text-amber-500 disabled:text-gray-400 disabled:cursor-not-allowed">
                     {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                </button>
                <p>
                    <button onClick={() => switchView('signin')} className="font-medium text-gray-500 hover:text-gray-700">
                        Go Back
                    </button>
                </p>
            </div>
        </div>
       </div>
    );
  }

  if (view === 'forgot_password') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Reset Password</h1>
            <p className="mt-2 text-gray-500">Enter your email to receive reset instructions.</p>
          </div>
          <form className="mt-8 space-y-4" onSubmit={handleForgotPassword}>
            <input id="email" name="email" type="email" autoComplete="email" required className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            {message && <p className="text-sm text-green-600 text-center">{message}</p>}
            <div>
              <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:bg-amber-300">
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </div>
          </form>
          <p className="text-center text-sm">
            <button onClick={() => switchView('signin')} className="font-medium text-amber-600 hover:text-amber-500">
              Back to Sign In
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">{view === 'signup' ? 'Create Student Account' : 'Hostel Login'}</h1>
            <p className="mt-2 text-gray-500">{view === 'signup' ? 'Get started by creating your account' : 'Sign in to manage your hostel'}</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleAuthAction}>
          <div className="rounded-md shadow-sm space-y-2">
            {view === 'signup' && (
              <>
                 <input name="name" type="text" required className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                 <input name="level" type="text" required className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" placeholder="Level (e.g., 100L)" value={level} onChange={(e) => setLevel(e.target.value)} />
                 <select name="gender" required className="appearance-none relative block w-full px-3 py-3 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" value={gender} onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}>
                    <option>Male</option>
                    <option>Female</option>
                 </select>
              </>
            )}
            <input id="email" name="email" type="email" autoComplete="email" required className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input id="password" name="password" type="password" autoComplete="current-password" required className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          
          {view === 'signin' && (
             <div className="flex items-center justify-end">
                <div className="text-sm">
                    <button type="button" onClick={() => switchView('forgot_password')} className="font-medium text-amber-600 hover:text-amber-500">
                        Forgot your password?
                    </button>
                </div>
             </div>
          )}

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:bg-amber-300">
              {loading ? 'Processing...' : (view === 'signup' ? 'Sign Up' : 'Sign In')}
            </button>
          </div>
        </form>
        <p className="text-center text-sm">
          <button onClick={() => switchView(view === 'signup' ? 'signin' : 'signup')} className="font-medium text-amber-600 hover:text-amber-500">
            {view === 'signup' ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;