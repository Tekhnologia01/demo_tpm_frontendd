import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setUser } from '../store/authSlice';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { jwtDecode } from 'jwt-decode';
import logo from '../assets/Images/logo.svg';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [generalError, setGeneralError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  });

  const handleSubmit = async (values: typeof initialValues, { setSubmitting }: any) => {
    try {
      setGeneralError(''); // Reset previous error
      const response = await axios.post(${import.meta.env.VITE_API_URL}/userlogin, {
        email: values.email,
        password: values.password,
      });
      const { token } = response.data;

      localStorage.setItem('token', token); // Store JWT token

      const decodedToken = jwtDecode(token); // Decode JWT token
      console.log('Decoded Token:', decodedToken);

      dispatch(setUser(decodedToken)); // Store user in Redux
      navigate('/'); // Redirect to dashboard
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen flex-1 flex-col justify-center px-6 py-12 bg-gray-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm bg-white p-8 rounded-2xl shadow-lg">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img alt="Your Company" src={logo} className="mx-auto h-10 w-auto" />
          <h2 className="mt-3 mb-10 text-center text-2xl font-bold tracking-tight text-gray-900">
            Bhagyesh
          </h2>
        </div>

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              {generalError && <p className="text-red-500 text-sm text-center">{generalError}</p>}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                  Email address
                </label>
                <div className="mt-2">
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600 sm:text-sm"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                    Password
                  </label>
                </div>
                <div className="mt-2 relative">
                  <Field
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md bg-white px-3 py-1.5 pr-10 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600 sm:text-sm" // Added pr-10 to prevent text overlap with icon
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div className="mt-2 relative">
                  <p className="text-sm mt-2 flex justify-end">
                    <Link to="/forgot" className="font-semibold text-[#080B6C] flex justify-end">
                      Forgot password?
                    </Link>
                  </p>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded-md bg-[#080B6C] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0A0E9A]"
                >
                  {isSubmitting ? 'Signin...' : 'Sign in'}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <p className="mt-10 text-center text-sm text-gray-500">
          Not a member?{' '}
          <Link to="/signup" className="font-semibold text-[#080B6C]">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

add this 
In your React component (e.g., LoginPage.tsx), make sure your API calls use:

ts
Copy
Edit
const apiUrl = import.meta.env.REACT_APP_API_URL;

axios.post(${apiUrl}/userlogin, {
  email,
  password,
});
If you're using fetch, it would look like:

ts
Copy
Edit
fetch(${apiUrl}/userlogin, { method: "POST", body: JSON.stringify({...}) });
