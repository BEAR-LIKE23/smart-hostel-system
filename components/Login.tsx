import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface LoginProps {
  onBack?: () => void;
  initialView?: 'signin' | 'signup';
}

const Login: React.FC<LoginProps> = ({ onBack, initialView = 'signin' }) => {
  const [view, setView] = useState<'signin' | 'signup' | 'verify_otp' | 'forgot_password'>(initialView);
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
        const { data, error: signUpError } = await supabase.auth.signUp({ 
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
        
        if (data.user) {
            if (data.session) {
                window.location.reload();
            } else {
                setView('verify_otp');
                setResendCooldown(60);
            }
        } else {
            throw new Error("Signup did not return a user object.");
        }

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
        const { data: { session }, error: verifyError } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'signup'
        });

        if (verifyError) throw verifyError;
        if (!session?.user) throw new Error("Verification successful, but no user session found.");

        const { error: sessionError } = await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token
        });

        if (sessionError) throw sessionError;

        setMessage("Verification successful! Finalizing your profile...");
        const user = session.user;
        let profileFound = false;
        const maxAttempts = 10;
        
        for (let i = 0; i < maxAttempts; i++) {
            const { data: student, error: queryError } = await supabase
                .from('students')
                .select('id')
                .eq('id', user.id)
                .single();

            if (student) {
                profileFound = true;
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (!profileFound) {
            throw new Error("Your account was created, but we couldn't find your student profile. Please try logging in.");
        }
        
        setMessage("Profile ready! Redirecting...");
        setTimeout(() => {
            window.location.reload();
        }, 500);

    } catch(err: any) {
        console.error('Verification error:', err);
        setError(err.error_description || err.message);
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

  // Shared classes for styling to keep things clean and reusable
  const inputClass = "appearance-none relative block w-full px-4 py-3 bg-white/40 dark:bg-black/30 border border-gray-300/40 dark:border-gray-700/40 text-gray-900 dark:text-white rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 sm:text-sm shadow-inner";
  const btnClass = "group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 shadow-lg shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none";

  if (view === 'verify_otp') {
    return (
       <div className="min-h-screen flex items-center justify-center bg-transparent p-4 transition-colors duration-300">
        <div className="relative w-full max-w-md p-8 sm:p-10 space-y-8 backdrop-blur-xl bg-white/50 dark:bg-gray-950/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/60 dark:border-gray-800/60 before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-gradient-to-r before:from-blue-500 before:to-indigo-500 before:rounded-t-3xl">
            <div className="text-center">
                <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Check Your Email</h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">We've sent a 6-digit verification code to <strong className="font-semibold text-gray-700 dark:text-gray-200">{email}</strong>.</p>
            </div>
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
                <input 
                    name="otp" 
                    type="text" 
                    required 
                    className="appearance-none text-center tracking-[0.8em] pl-[0.8em] relative block w-full px-4 py-3 bg-white/40 dark:bg-black/30 border border-gray-300/40 dark:border-gray-700/40 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-lg shadow-inner" 
                    placeholder="______" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    maxLength={6}
                />
                 {error && <p className="text-xs text-red-500 text-center font-medium bg-red-50 dark:bg-red-950/30 py-2 px-3 rounded-lg border border-red-200/50 dark:border-red-900/50">{error}</p>}
                 {message && <p className="text-xs text-green-600 text-center font-medium bg-green-50 dark:bg-green-950/30 py-2 px-3 rounded-lg border border-green-200/50 dark:border-green-900/50">{message}</p>}
                <div>
                    <button type="submit" disabled={loading} className={btnClass}>
                        {loading ? 'Verifying...' : 'Verify Account'}
                    </button>
                </div>
            </form>
             <div className="text-center text-sm space-y-3 pt-2">
                <button 
                    onClick={handleResendOtp} 
                    disabled={resendCooldown > 0 || loading}
                    className="font-semibold text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                     {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                </button>
                <p>
                    <button onClick={() => switchView('signin')} className="font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
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
      <div className="min-h-screen flex items-center justify-center bg-transparent p-4 transition-colors duration-300">
        <div className="relative w-full max-w-md p-8 sm:p-10 space-y-8 backdrop-blur-xl bg-white/50 dark:bg-gray-950/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/60 dark:border-gray-800/60 before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-gradient-to-r before:from-blue-500 before:to-indigo-500 before:rounded-t-3xl">
          {onBack && (
            <button 
              onClick={onBack}
              className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          )}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Reset Password</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Enter your email to receive reset instructions.</p>
          </div>
          <form className="space-y-6" onSubmit={handleForgotPassword}>
            <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <p className="text-xs text-red-500 text-center font-medium bg-red-50 dark:bg-red-950/30 py-2 px-3 rounded-lg border border-red-200/50 dark:border-red-900/50">{error}</p>}
            {message && <p className="text-xs text-green-600 text-center font-medium bg-green-50 dark:bg-green-950/30 py-2 px-3 rounded-lg border border-green-200/50 dark:border-green-900/50">{message}</p>}
            <div>
              <button type="submit" disabled={loading} className={btnClass}>
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </div>
          </form>
          <p className="text-center text-sm pt-2">
            <button onClick={() => switchView('signin')} className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              Back to Sign In
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 transition-colors duration-300">
      <div className="relative w-full max-w-md p-8 sm:p-10 space-y-6 backdrop-blur-xl bg-white/50 dark:bg-gray-950/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/60 dark:border-gray-800/60 before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-gradient-to-r before:from-blue-500 before:to-indigo-500 before:rounded-t-3xl">
        {onBack && (
          <button 
            onClick={onBack}
            className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        )}
        
        <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              {view === 'signup' ? 'Create Account' : 'Hostel Login'}
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {view === 'signup' ? 'Get started by creating your student profile' : 'Sign in to manage your hostel'}
            </p>
        </div>

        <form className="space-y-4 pt-2" onSubmit={handleAuthAction}>
          <div className="space-y-3">
            {view === 'signup' && (
              <>
                 <input name="name" type="text" required className={inputClass} placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                 <input name="level" type="text" required className={inputClass} placeholder="Level (e.g., 100L)" value={level} onChange={(e) => setLevel(e.target.value)} />
                 
                 <div className="relative">
                   <select 
                     name="gender" 
                     required 
                     className="appearance-none relative block w-full px-4 py-3 bg-white/40 dark:bg-black/30 border border-gray-300/40 dark:border-gray-700/40 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 sm:text-sm shadow-inner cursor-pointer" 
                     value={gender} 
                     onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                   >
                       <option value="Male" className="dark:bg-gray-900">Male</option>
                       <option value="Female" className="dark:bg-gray-900">Female</option>
                   </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                     <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                   </div>
                 </div>
              </>
            )}
            <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          
          {view === 'signin' && (
             <div className="flex items-center justify-end">
                <div className="text-xs">
                    <button type="button" onClick={() => switchView('forgot_password')} className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                        Forgot your password?
                    </button>
                </div>
             </div>
          )}

          {error && <p className="text-xs text-red-500 text-center font-medium bg-red-50 dark:bg-red-950/30 py-2 px-3 rounded-lg border border-red-200/50 dark:border-red-900/50">{error}</p>}

          <div className="pt-2">
            <button type="submit" disabled={loading} className={btnClass}>
              {loading ? 'Processing...' : (view === 'signup' ? 'Sign Up' : 'Sign In')}
            </button>
          </div>
        </form>
        
        <p className="text-center text-sm pt-2">
          <button onClick={() => switchView(view === 'signup' ? 'signin' : 'signup')} className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
            {view === 'signup' ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;