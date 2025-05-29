import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import { RootState } from '../store';
import userlogo from '../assets/Images/user.png';
import { FaPencilAlt } from 'react-icons/fa';

interface UserData {
  user_Id: number;
  Name: string;
  Contact: string;
  Email: string;
}

interface UpdateUserData {
  user_Id: number;
  name: string;
  email: string;
  contact: string | number;
  password?: string;
}

const profileValidationSchema = Yup.object().shape({
  Name: Yup.string().required('Name is required'),
  Email: Yup.string()
    .email('Invalid email format')
    .required('Email is required')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Email must be a valid email address'
    ),
  Contact: Yup.string()
    .required('Phone is required')
    .matches(
      /^\+?[1-9]\d{1,14}$/,
      'Phone number must be a valid format (e.g., +1234567890 or 1234567890)'
    )
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number cannot exceed 15 digits'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .notRequired(),
  confirmPassword: Yup.string().when('newPassword', {
    is: (newPassword: string) => !!newPassword,
    then: (schema) =>
      schema
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Confirm password is required when new password is provided'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const API_URL = import.meta.env.VITE_API_URL;
  const adminId = user?.adminId || localStorage.getItem('adminId');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!adminId) {
        toast.error('Admin ID not found');
        return;
      }

      setLoading(true);
      try {
        const response = await axiosInstance.get(`${API_URL}/fetchuserprofile`, {
          params: { adminId },
        });
        const userProfile = response.data.data;
        setUserData(userProfile);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [API_URL, adminId]);

  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  };

  const handleProfileSubmit = async (
    values: UserData & {
      newPassword: string;
      confirmPassword: string;
    }
  ) => {
    if (!adminId || !userData) {
      toast.error('Admin ID or user data not found');
      return;
    }

    try {
      const payload: UpdateUserData = {
        user_Id: userData.user_Id,
        name: values.Name,
        email: values.Email,
        contact: values.Contact,
      };
      if (values.newPassword) {
        payload.password = values.newPassword;
      }
      await axiosInstance.put(`${API_URL}/updatemyprofile`, payload);
      setUserData({
        user_Id: userData.user_Id,
        Name: values.Name,
        Email: values.Email,
        Contact: values.Contact,
      });
      toast.success('Profile updated successfully');
      setIsEditMode(false);
      setProfileImage(null);
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setProfileImage(null);
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) return <div className="text-black">Loading...</div>;
  if (!userData) return <div className="text-black">No user data available</div>;

  const defaultProfileImage = userlogo;
  const displayImage = previewImage || defaultProfileImage;

  return (
    <div className="flex items-center justify-center p-4">
      <div className="font-std mb-10 w-full max-w-4xl rounded-2xl bg-white p-10 font-normal leading-relaxed text-gray-900 shadow-xl">
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row justify-between mb-5 items-start">
            <h2 className="mb-5 text-4xl font-bold text-blue-600">Update Profile</h2>
          </div>

          <div className="text-center mb-5">
            <div className="relative inline-block">
              <img
                src={displayImage}
                alt="Profile"
                className="rounded-full w-32 h-32 mx-auto border-4 border-blue-500 mb-4 transition-transform duration-300 hover:scale-105 ring ring-gray-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultProfileImage;
                }}
              />
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className="absolute bottom-4 right-0 bg-white text-blue-500 hover:text-blue-700 rounded-full p-2 border border-gray-300 shadow-md"
                title={isEditMode ? 'Cancel Edit' : 'Edit Profile'}
              >
                <FaPencilAlt className="w-4 h-4" />
              </button>
            </div>
            {isEditMode && (
              <div className="text-center mt-4">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400"
                >
                  Update Profile Picture
                </button>
              </div>
            )}
          </div>

          {isEditMode ? (
            <Formik
              initialValues={{
                user_Id: userData.user_Id,
                Name: userData.Name || '',
                Email: userData.Email || '',
                Contact: userData.Contact || '',
                newPassword: '',
                confirmPassword: '',
              }}
              validationSchema={profileValidationSchema}
              onSubmit={handleProfileSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="Name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <Field
                      type="text"
                      id="Name"
                      name="Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    {touched.Name && errors.Name && (
                      <p className="text-blue-500 text-sm mt-1">{errors.Name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="Email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Field
                      type="email"
                      id="Email"
                      name="Email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    {touched.Email && errors.Email && (
                      <p className="text-blue-500 text-sm mt-1">{errors.Email}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="Contact" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <Field
                      type="tel"
                      id="Contact"
                      name="Contact"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    {touched.Contact && errors.Contact && (
                      <p className="text-blue-500 text-sm mt-1">{errors.Contact}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password (Optional)
                    </label>
                    <Field
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    {touched.newPassword && errors.newPassword && (
                      <p className="text-blue-500 text-sm mt-1">{errors.newPassword}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password (Optional)
                    </label>
                    <Field
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <p className="text-blue-500 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400"
                    >
                      Save Profile
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">{userData.Name || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">{userData.Email || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">{userData.Contact || '-'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;