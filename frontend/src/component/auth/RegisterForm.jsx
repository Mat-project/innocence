import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../service/api';

const PasswordRequirements = ({ password }) => {
  const requirements = [
    { text: 'At least 8 characters', test: pwd => pwd.length >= 8 },
    { text: 'One uppercase letter', test: pwd => /[A-Z]/.test(pwd) },
    { text: 'One number', test: pwd => /[0-9]/.test(pwd) },
    { text: 'One special character (!@#$%^&*(),.?":{}|<>)', test: pwd => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
  ];

  return (
    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
      <p className="font-medium mb-1">Password requirements:</p>
      <ul className="space-y-1">
        {requirements.map((req, index) => (
          <li 
            key={index} 
            className={`flex items-center space-x-2 ${
              password && req.test(password) 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {password && req.test(password) ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
              </svg>
            )}
            <span>{req.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear username error when username is changed
    if (name === 'username' && usernameError) {
      setUsernameError('');
    }
    
    if (error) setError('');
  };

  // Check username availability when the user stops typing
  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) return;
    
    setIsCheckingUsername(true);
    try {
      const response = await authAPI.checkUsername(username);
      if (response.data && !response.data.available) {
        setUsernameError('This username is already taken');
      } else {
        setUsernameError('');
      }
    } catch (err) {
      console.error('Error checking username:', err);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Add debounced username check
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (formData.username && formData.username.length >= 3) {
        checkUsernameAvailability(formData.username);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check username availability one more time before submission
    if (formData.username && formData.username.length >= 3) {
      try {
        const response = await authAPI.checkUsername(formData.username);
        if (response.data && !response.data.available) {
          setUsernameError('This username is already taken');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error checking username:', err);
      }
    }

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register(formData);
      if (response.data.tokens) {
        const { access, refresh } = response.data.tokens;
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      let errorMessage = '';
      const errorData = err.response?.data;
      
      if (errorData) {
        if (errorData.details && typeof errorData.details === 'object') {
          const errors = [];
          Object.entries(errorData.details).forEach(([field, message]) => {
            if (Array.isArray(message)) {
              errors.push(...message);
            } else if (message) {
              errors.push(message);
            }
          });
          errorMessage = errors.join('\n');
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.details) {
          errorMessage = errorData.details;
        }
      }
      if (!errorMessage) {
        errorMessage = err.message || 'Registration failed. Please try again.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-black py-12 px-4 sm:px-6 lg:px-8 fixed inset-0 overflow-y-auto">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 mx-auto my-auto">
        {/* Add Back to Home link */}
        <div className="absolute top-6 left-6">
          <Link 
            to="/" 
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
        
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Join us to boost your productivity
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/50 p-4 shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-200 whitespace-pre-line">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <div className="mt-1 relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${usernameError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={() => formData.username && checkUsernameAvailability(formData.username)}
                />
                {isCheckingUsername && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              {usernameError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-500">{usernameError}</p>
              )}
              {formData.username && formData.username.length > 0 && formData.username.length < 3 && (
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">Username must be at least 3 characters long</p>
              )}
              {formData.username && formData.username.length >= 3 && !usernameError && !isCheckingUsername && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">Username is available</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="Confirm your password"
                  value={formData.password_confirm}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <PasswordRequirements password={formData.password} />

          <div>
            <button
              type="submit"
              disabled={loading || usernameError || (formData.username && formData.username.length < 3)}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black dark:text-white ${
                loading || usernameError || (formData.username && formData.username.length < 3)
                  ? 'bg-indigo-400 dark:bg-indigo-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out transform hover:scale-[1.02]`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="flex items-center justify-center mt-6">
            <div className="text-sm">
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
