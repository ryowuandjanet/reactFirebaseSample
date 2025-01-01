import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { currentUser, logout, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showResetMessage, setShowResetMessage] = useState(false);
  const [error, setError] = useState('');

  if (!currentUser) {
    return null;
  }

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('登出失敗:', error);
    }
  }

  async function handleResetPassword() {
    try {
      setError('');
      await resetPassword(currentUser.email);
      setShowResetMessage(true);
      setTimeout(() => setShowResetMessage(false), 5000); // 5秒後自動隱藏訊息
    } catch (error) {
      console.error('重設密碼失敗:', error);
      setError('重設密碼郵件發送失敗，請稍後再試');
      setTimeout(() => setError(''), 5000); // 5秒後自動隱藏錯誤訊息
    }
  }

  return (
    <>
      <nav className="bg-white shadow-lg relative">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold">
              首頁
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="hover:text-blue-600">
                個人資料
              </Link>
              <button
                onClick={handleResetPassword}
                className="hover:text-blue-600"
              >
                重設密碼
              </button>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="hover:text-blue-600"
              >
                登出
              </button>
            </div>
          </div>
        </div>

        {/* 成功訊息 */}
        {showResetMessage && (
          <div className="absolute top-16 right-0 left-0 bg-green-100 border border-green-400 text-green-700 px-4 py-3 text-center">
            重設密碼連結已發送到您的電子郵件，請查收！
          </div>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <div className="absolute top-16 right-0 left-0 bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-center">
            {error}
          </div>
        )}
      </nav>

      {/* 為訊息預留空間 */}
      {(showResetMessage || error) && <div className="h-12"></div>}

      {/* 登出確認對話框 */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">確認登出</h3>
            <p className="text-gray-600 mb-6">您確定要登出嗎？</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded"
              >
                取消
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setShowLogoutConfirm(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                確認登出
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
