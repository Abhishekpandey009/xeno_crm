import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronDown, BarChart, Send, Clock, Users } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const closeDropdown = () => setShowDropdown(false);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) => 
    `px-4 py-2 rounded-md transition-colors duration-200 ${
      isActive 
        ? 'bg-primary-100 text-primary-700 font-medium' 
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <Link to="/" className="flex items-center space-x-2">
            <BarChart className="h-7 w-7 text-primary-600" />
            <span className="text-xl font-bold text-gray-800">MarketPro</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/segments/builder" className={navLinkClasses}>
              <div className="flex items-center space-x-1">
                <Users size={18} />
                <span>Segments</span>
              </div>
            </NavLink>
            <NavLink to="/campaigns/new" className={navLinkClasses}>
              <div className="flex items-center space-x-1">
                <Send size={18} />
                <span>New Campaign</span>
              </div>
            </NavLink>
            <NavLink to="/campaigns/history" className={navLinkClasses}>
              <div className="flex items-center space-x-1">
                <Clock size={18} />
                <span>History</span>
              </div>
            </NavLink>
          </div>

          {/* User profile */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                />
                <span className="font-medium text-gray-700">{user?.name}</span>
                <ChevronDown size={16} className="text-gray-500" />
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                  <button
                    onClick={() => {
                      logout();
                      closeDropdown();
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors duration-200"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-inner border-t border-gray-100">
          <div className="container mx-auto px-4 py-2 space-y-1">
            <NavLink
              to="/segments/builder"
              className={navLinkClasses}
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center space-x-2">
                <Users size={18} />
                <span>Segments</span>
              </div>
            </NavLink>
            <NavLink
              to="/campaigns/new"
              className={navLinkClasses}
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center space-x-2">
                <Send size={18} />
                <span>New Campaign</span>
              </div>
            </NavLink>
            <NavLink
              to="/campaigns/history"
              className={navLinkClasses}
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center space-x-2">
                <Clock size={18} />
                <span>History</span>
              </div>
            </NavLink>
            
            {/* Mobile user profile */}
            <div className="pt-2 border-t border-gray-100 mt-2">
              <div className="flex items-center space-x-2 px-4 py-2">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                />
                <span className="font-medium text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;