import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Menu,
  X,
  TreePine,
  User,
  LogOut
} from 'lucide-react';
import AuthContext from '../Authorisation/AuthProvider.jsx';
import { useAuthState } from '../hooks/useAuthState';

const DashboardNav = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { user } = useAuthState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(false);
    navigate('/profile');
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  return (
    <nav 
      className="fixed w-full z-40"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(34, 197, 94, 0.1)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2 px-2 py-1 rounded-lg">
            <TreePine className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            <span className="ml-2 text-lg sm:text-xl font-extrabold text-green-800 tracking-tight drop-shadow">KrushiSetu</span>
          </Link>

          {/* Right: Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-[rgb(6,86,6)] text-base xl:text-[18px] font-medium font-[Outfit]">
            <Link to="/dashboard" className="block text-green-800 hover:text-green-600 transition-colors duration-200">Dashboard</Link>
            <Link to="/news" className="block text-green-800 hover:text-green-600 transition-colors duration-200">News</Link>
            <Link to="/calendar" className="block text-green-800 hover:text-green-600 transition-colors duration-200">Calendar</Link>

            {/* User Profile */}
            <div className="relative profile-dropdown">
              <button
                onClick={toggleProfileDropdown}
                className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full cursor-pointer border-2 border-white shadow-md"
              >
                <span className="text-white font-semibold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700"
                  >
                    <User className="w-4 h-4 mr-3 text-green-600" />
                    Profile
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-green-800 p-2 rounded-lg"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white/95 border-t border-green-100 rounded-b-2xl shadow-lg">
          <div className="px-4 pt-4 pb-4 space-y-2">
            <Link to="/dashboard" className="block px-3 py-2 text-green-800 rounded-lg font-semibold" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
            <Link to="/news" className="block px-3 py-2 text-green-800 rounded-lg font-semibold" onClick={() => setIsMenuOpen(false)}>News</Link>
            <Link to="/calendar" className="block px-3 py-2 text-green-800 rounded-lg font-semibold" onClick={() => setIsMenuOpen(false)}>Calendar</Link>

            {/* Mobile User Profile */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full border-2 border-white shadow-md">
                  <span className="text-white font-semibold text-base">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-1">
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center px-3 py-2 text-green-800 hover:bg-green-50 rounded-lg font-semibold transition"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default DashboardNav;
