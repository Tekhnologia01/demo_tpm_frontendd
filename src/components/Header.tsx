import { MdMenu, MdMenuOpen } from 'react-icons/md';
import { Dispatch, SetStateAction } from 'react';
import logo from '../assets/Images/logo.svg';
import UserDropdown from './UserDropdown';

interface HeaderProps {
  showSideBar: boolean;
  setShowSideBar: Dispatch<SetStateAction<boolean>>;
  showSearch: boolean;
  setShowSearch: Dispatch<SetStateAction<boolean>>;
}

const Header = ({ showSideBar, setShowSideBar}: HeaderProps) => {
  return (
    <div className="w-full fixed top-0 z-50 shadow-md">
      <div className="w-full h-16 sm:h-20 flex justify-between items-center px-4 sm:px-6 lg:px-8 bg-white transition-all duration-300 ease-in-out">
        {/* Logo and Sidebar Toggle Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <img src={logo} alt="logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">TPM</h1>
          <button
            className="p-2 rounded-full flex justify-center items-center hover:bg-gray-100 transition-all duration-300 ease-in-out ml-2 sm:ml-4"
            onClick={() => setShowSideBar((prev) => !prev)}
          >
            {showSideBar ? (
              <MdMenuOpen size={24} className="text-gray-700 hover:text-blue-600 transition-all duration-300 ease-in-out" />
            ) : (
              <MdMenu size={24} className="text-gray-700 hover:text-blue-600 transition-all duration-300 ease-in-out" />
            )}
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search Toggle Button */}
          
          {/* User Dropdown */}
          <UserDropdown />
        </div>
      </div>
      {/* Search Bar */}
      
      
    </div>
  );
};

export default Header;