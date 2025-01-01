import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth, sendEmailVerification } from '../firebase';

function VerifyEmail() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    // 檢查是否是從驗證連結過來的
    if (mode === 'verifyEmail' && oobCode) {
      handleVerification();
    }
    // 如果用戶已驗證，重定向到登入頁面
    else if (!currentUser || currentUser.emailVerified) {
      navigate('/login');
    }
  }, [currentUser, navigate, mode, oobCode]);

  async function handleVerification() {
    try {
      await auth.applyActionCode(oobCode);
      setMessage('電子郵件驗證成功！請重新登入。');
      setTimeout(() => {
        navigate('/login');
      }, 3000); // 3秒後自動跳轉到登入頁面
    } catch (error) {
      console.error('驗證錯誤:', error);
      setError('驗證連結無效或已過期，請重新發送驗證郵件。');
    }
  }

  async function handleResendEmail() {
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await sendEmailVerification(auth.currentUser);
      setMessage('驗證郵件已重新發送！請查收您的電子郵件。');
    } catch (error) {
      setError('重新發送驗證郵件失敗，請稍後再試。');
    } finally {
      setLoading(false);
    }
  }

  // 如果是驗證成功的狀態，顯示成功訊息
  if (message && message.includes('驗證成功')) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              驗證成功！
            </h2>
            <p className="mt-2 text-gray-600">
              您的電子郵件已成功驗證，即將為您跳轉到登入頁面...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">電子郵件驗證</h2>

        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <p className="mb-2">
            驗證郵件已發送至：
            <strong>{currentUser?.email}</strong>
          </p>
          <p>請查收您的電子郵件並點擊驗證連結。</p>
          <p className="mt-2 text-sm">完成驗證後，請重新登入系統。</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {message && !message.includes('驗證成功') && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        <div className="text-center">
          <p className="mb-4 text-gray-600">沒有收到驗證郵件？</p>
          <button
            onClick={handleResendEmail}
            disabled={loading}
            className={`bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? '發送中...' : '重新發送驗證郵件'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-500 hover:text-blue-600"
          >
            返回登入頁面
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
