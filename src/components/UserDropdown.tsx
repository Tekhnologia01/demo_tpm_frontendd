import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import userImg from '../assets/Images/user.png';
import { RootState } from '../store';
import LogoutConfirmation from './LogoutConfirmation';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = React.useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setShowLogoutConfirmation(false);
  };

  // Navigate to profile page
  const handleProfileClick = () => {
    navigate('/profile'); // Redirect to /profile
    setIsOpen(false); // Close the dropdown after clicking
  };

  // Placeholder user name (replace with actual user data from token if available)
  const userName = user?.name || 'Admin';

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex gap-2 items-center">
        <div className="w-[30px] sm:w-[40px] h-[30px] sm:h-[40px] rounded-full border border-[#0858F7] p-0.5">
          <img src={userImg} alt="profile" className="w-full h-full rounded-full" />
        </div>
        <div className="flex flex-col gap-0.5 justify-center items-start sm:flex">
          <h1 className="font-inter font-semibold text-sm text-black">{userName}</h1>
        </div>
      </div>
      {isOpen && (
        <div className="absolute right-0 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <ul className="py-1">
            <li
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={handleProfileClick} // Add onClick handler for Profile
            >
              Profile
            </li>
            <li
              className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
              onClick={handleLogout}
            >
              Logout
            </li>
          </ul>
        </div>
      )}
      <LogoutConfirmation isOpen={showLogoutConfirmation} onClose={handleCloseConfirmation} />
    </div>
  );
};

export default UserDropdown;