import React from 'react';
import { useSignUpEmailPassword } from '@nhost/react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, Eye, EyeOff } from 'lucide-react';
import { gql, useMutation } from '@apollo/client';

// GraphQL mutation to insert user data into the database
const INSERT_USER = gql`
  mutation InsertUser($id: uuid!, $email: String!, $name: String!) {
    insert_users_one(object: { id: $id, email: $email, name: $name }) {
      id
      email
      name
    }
  }
`;

export default function Signup() {
  const { signUpEmailPassword, isLoading, isError, error } = useSignUpEmailPassword();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();
  const [insertUser] = useMutation(INSERT_USER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sign up the user
    const { user, error: signUpError } = await signUpEmailPassword(email, password, {
      displayName: name,
    });

    if (signUpError) {
      console.error('Error during signup:', signUpError);
      return;
    }

    if (user) {
      // Insert user data into the database
      await insertUser({
        variables: {
          id: user.id,
          email: user.email,
          name: user.displayName || name,
        },
      });

      // Redirect to login page
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Newspaper className="w-12 h-12 text-blue-600 animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            News Digest
          </h1>
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error?.message}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                placeholder="Enter your name"
              />
            </div>

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
                placeholder="Enter your email"
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
                  placeholder="Enter your password"
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
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a
                href="/login" // Replace with your login route
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}