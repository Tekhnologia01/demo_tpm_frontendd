import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../assets/Images/logo.svg';

// Validation schemas for each step
const emailSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
});

const otpSchema = Yup.object({
  otp: Yup.string()
    .length(6, 'OTP must be exactly 6 digits')
    .required('OTP is required'),
});

const passwordSchema = Yup.object({
  password: Yup.string()
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%`~#^&*()-_+={};:'",.<>*?&])[A-Za-z\d@$!%`~#^&*()-_+={};:'",.<>*?&]{8,}$/,
      'Password must be at least 8 characters long, including letters, numbers, and one special character'
    )
    .required('Password is required'),
  repassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match') // Fixed: Removed null
    .required('Re-enter password is required'),
});

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState<string>(''); // Store email across steps
  const [generalError, setGeneralError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showRePassword, setShowRePassword] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(60);
  const [isResendDisabled, setIsResendDisabled] = useState<boolean>(false);

  // Timer for OTP resend
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timer > 0 && isResendDisabled) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, isResendDisabled]);

  // Handle sending OTP
  const handleSendOTP = async (values: { email: string }, { setSubmitting, setFieldError }: any) => {
    setIsLoading(true);
    setGeneralError('');
    setSuccessMessage('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/sendOTP`, {
        email: values.email,
      });
      if (response.data?.message === 'Verification code sent to email') {
        setEmail(values.email);
        setCurrentScreen('otp');
        setTimer(60);
        setIsResendDisabled(true);
        setSuccessMessage(`OTP sent to ${values.email}`);
      } else {
        setFieldError('email', 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  // Handle resending OTP
  const handleResendOTP = async () => {
    setIsLoading(true);
    setGeneralError('');
    setSuccessMessage('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/sendOTP`, {
        email,
      });
      if (response.data?.message === 'Verification code sent to email') {
        setTimer(60);
        setIsResendDisabled(true);
        setSuccessMessage(`New OTP sent to ${email}`);
      }
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verifying OTP
  const handleVerifyOTP = async (values: { otp: string }, { setSubmitting, setFieldError }: any) => {
    setIsLoading(true);
    setGeneralError('');
    setSuccessMessage('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/verifyOTP`, {
        email,
        enteredCode: values.otp,
      });
      if (response.data?.message === 'Verification successful') {
        setCurrentScreen('password');
        setSuccessMessage('OTP verified successfully!');
      } else {
        setFieldError('otp', response.data?.error || 'Invalid OTP. Please try again.');
        setGeneralError(response.data?.error || 'Invalid OTP. Please try again.');
      }
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (values: { password: string }, { setSubmitting }: any) => {
    setIsLoading(true);
    setGeneralError('');
    setSuccessMessage('');
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/forgetPassword`, {
        email,
        newPassword: values.password,
      });
      if (response.data?.status) {
        setSuccessMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setGeneralError('Failed to reset password. Please try again.');
      }
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen flex-1 flex-col justify-center px-6 py-12 bg-gray-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm bg-white p-8 rounded-2xl shadow-lg">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img alt="Your Company" src={logo} className="mx-auto h-10 w-auto" />
          <h2 className="mt-3 mb-10 text-center text-2xl font-bold tracking-tight text-gray-900">
            {currentScreen === 'email'
              ? 'Forgot Password'
              : currentScreen === 'otp'
              ? 'Verify OTP'
              : 'Reset Password'}
          </h2>
        </div>

        {currentScreen === 'email' && (
          <Formik initialValues={{ email: '' }} validationSchema={emailSchema} onSubmit={handleSendOTP}>
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                {generalError && <p className="text-red-500 text-sm text-center">{generalError}</p>}
                {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}

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
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="flex w-full justify-center rounded-md bg-[#080B6C] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0A0E9A]"
                  >
                    {isLoading ? 'Sending...' : 'Get OTP'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}

        {currentScreen === 'otp' && (
          <Formik initialValues={{ otp: '' }} validationSchema={otpSchema} onSubmit={handleVerifyOTP}>
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                {generalError && <p className="text-red-500 text-sm text-center">{generalError}</p>}
                {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}

                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-900">
                    Enter OTP
                  </label>
                  <div className="mt-2">
                    <Field
                      id="otp"
                      name="otp"
                      type="text"
                      maxLength={6}
                      required
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600 sm:text-sm text-center"
                    />
                    <ErrorMessage name="otp" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>

                <div className="text-sm text-center">
                  {isResendDisabled ? (
                    <p className="text-gray-500">Resend OTP in {timer} seconds</p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="font-semibold text-[#080B6C] hover:text-[#0A0E9A]"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="flex w-full justify-center rounded-md bg-[#080B6C] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0A0E9A]"
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}

        {currentScreen === 'password' && (
          <Formik
            initialValues={{ password: '', repassword: '' }}
            validationSchema={passwordSchema}
            onSubmit={handleResetPassword}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                {generalError && <p className="text-red-500 text-sm text-center">{generalError}</p>}
                {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                    New Password
                  </label>
                  <div className="mt-2 relative">
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="block w-full rounded-md bg-white px-3 py-1.5 pr-10 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                    </button>
                    <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>

                <div>
                  <label htmlFor="repassword" className="block text-sm font-medium text-gray-900">
                    Confirm Password
                  </label>
                  <div className="mt-2 relative">
                    <Field
                      id="repassword"
                      name="repassword"
                      type={showRePassword ? 'text' : 'password'}
                      required
                      className="block w-full rounded-md bg-white px-3 py-1.5 pr-10 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRePassword(!showRePassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showRePassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                    </button>
                    <ErrorMessage name="repassword" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="flex w-full justify-center rounded-md bg-[#080B6C] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0A0E9A]"
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}

        <p className="mt-10 text-center text-sm text-gray-500">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-[#080B6C]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;