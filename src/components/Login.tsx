import React from 'react';
import axios from 'axios';
import {
  useSignInEmailPassword,
  useSignUpEmailPassword,
  useSignOut,
  useAccessToken,
  useAuthenticationStatus,
} from '@nhost/react';
import { Newspaper, Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export default function Login() {
  const {
    signInEmailPassword,
    isLoading: isSignInLoading,
    isError: isSignInError,
    error: signInError,
  } = useSignInEmailPassword();

  const {
    signUpEmailPassword,
    isLoading: isSignUpLoading,
    isError: isSignUpError,
    error: signUpError,
    needsEmailVerification,
  } = useSignUpEmailPassword();

  const { signOut } = useSignOut();
  const { isAuthenticated } = useAuthenticationStatus();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const response = await signUpEmailPassword(email, password);
        console.log('Sign-up Response:', response);

        if (response.isError) {
          console.error('Sign-up error:', response.error);
          toast.error(response.error?.message || 'Sign-up failed. Please try again.');
        } else {
          toast.success('A verification email has been sent. Please check your inbox.');
          setIsSignUp(false);
        }
      } else {
        const response = await signInEmailPassword(email, password);
        console.log('Sign-in Response:', response);

        if (response.isError) {
          console.error('Sign-in error:', response.error);
          toast.error(response.error?.message || 'Sign-in failed. Please try again.');
        } else if (needsEmailVerification) {
          toast.error('Please verify your email before logging in. Check your inbox for the verification link.');
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <Toaster />
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Newspaper className="w-12 h-12 text-blue-600 animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            News Digest
          </h1>
          <p className="mt-2 text-gray-600">
            {isSignUp ? 'Create your account' : 'Welcome back! Sign in to continue'}
          </p>
        </div>

        {isAuthenticated ? (
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100 text-center">
            <h2 className="text-xl font-semibold mb-4">You're logged in!</h2>
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                  placeholder={isSignUp ? "Enter your email to sign up" : "Enter your email to sign in"}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200 pr-10"
                    placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSignInLoading || isSignUpLoading || isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSignUp
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50`}
              >
                {isSignUp ? (isSignUpLoading ? 'Signing up...' : 'Sign up') : (isSignInLoading ? 'Signing in...' : 'Sign in')}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
