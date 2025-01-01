import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('重設密碼連結已發送到您的電子郵件，請查收！');
      setEmail(''); // 清空輸入欄位
    } catch (error) {
      console.error(error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('找不到此電子郵件帳號');
          break;
        case 'auth/invalid-email':
          setError('無效的電子郵件格式');
          break;
        case 'auth/too-many-requests':
          setError('請求次數過多，請稍後再試');
          break;
        default:
          setError('發送重設密碼連結失敗，請稍後再試');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">重設密碼</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              電子郵件
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="請輸入您的電子郵件"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? '發送中...' : '發送重設密碼連結'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm">
            <Link to="/login" className="text-blue-500 hover:text-blue-600">
              返回登入
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            還沒有帳號？{' '}
            <Link to="/register" className="text-blue-500 hover:text-blue-600">
              點此註冊
            </Link>
          </p>
        </div>

        {message && (
          <div className="mt-4 text-sm text-gray-600">
            <p>提醒：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>請檢查您的收件匣和垃圾郵件資料夾</li>
              <li>重設密碼連結將在 1 小時後失效</li>
              <li>如果沒有收到郵件，請稍後再試一次</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
