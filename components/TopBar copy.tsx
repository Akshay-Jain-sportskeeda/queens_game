import React, { useState } from 'react';
import { User, LogIn, LogOut, Edit } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import EditProfileModal from './EditProfileModal';

interface TopBarProps {
  user: FirebaseUser | null;
  activeTab: 'game' | 'leaderboard' | 'dashboard';
  onTabChange: (tab: 'game' | 'leaderboard' | 'dashboard') => void;
  onShowLogin: () => void;
  onLogout: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  user,
  activeTab,
  onTabChange,
  onShowLogin,
  onLogout
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  return (
    <>
      <div className="bg-red-600 text-white shadow-lg" style={{ backgroundColor: '#cc3333' }}>
        <div className="container mx-auto px-4 py-1 md:py-2">
          {/* Single row layout: Game name, tabs, and user profile */}
          <div className="flex items-center justify-between relative">
            {/* Game Name - desktop only */}
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-white">NFL Duo</h1>
            </div>

            {/* Tabs - centered on mobile, left-aligned on desktop */}
            <div className="flex justify-center md:flex-initial absolute left-1/2 -translate-x-1/2">
              <div className="flex bg-white bg-opacity-20 rounded-lg p-0.5 text-xs md:p-0.5">
                <button
                  onClick={() => onTabChange('game')}
                  className={`px-2 md:px-4 py-1 md:py-2 rounded-md font-medium transition-colors text-xs md:text-sm ${
                    activeTab === 'game'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-white hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  Game
                </button>
                <div className="w-px bg-white bg-opacity-30 mx-1"></div>
                <button
                  onClick={() => {
                    onTabChange('leaderboard');
                    // Scroll to top when switching to leaderboard
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-2 md:px-4 py-1 md:py-2 rounded-md font-medium transition-colors text-xs md:text-sm ${
                    activeTab === 'leaderboard'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-white hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  Leaderboard
                </button>
                <div className="w-px bg-white bg-opacity-30 mx-1"></div>
                <button
                  onClick={() => {
                    onTabChange('dashboard');
                    // Scroll to top when switching to dashboard
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-2 md:px-4 py-1 md:py-2 rounded-md font-medium transition-colors text-xs md:text-sm ${
                    activeTab === 'dashboard'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-white hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  Dashboard
                </button>
              </div>
            </div>

            {/* User Profile - only show for logged in users */}
            {/* User Profile - show for both logged in and guest users */}
            <div className="flex justify-end ml-auto">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center justify-center hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition-colors md:gap-2"
                >
                  <div className="w-7 h-7 bg-transparent border-2 border-white rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden md:inline text-white text-sm">
                    {user ? (user.displayName || user.email?.split('@')[0] || 'User') : 'Guest'}
                  </span>
                </button>

                {/* User dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[120px] z-50">
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="text-sm font-medium text-gray-800">
                            {user.displayName || user.email?.split('@')[0] || 'User'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setShowEditProfile(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onLogout();
                            setShowUserMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          onShowLogin();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm"
                      >
                        <LogIn className="w-4 h-4" />
                        Login
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && user && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditProfile(false)}
        />
      )}
    </>
  );
};

export default TopBar;