import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatingCode, setValidatingCode] = useState(true);
  const [oobCode, setOobCode] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 從 URL 取得重設碼
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('oobCode');

    if (!code) {
      setError('無效的重設連結');
      setValidatingCode(false);
      return;
    }

    // 驗證重設碼
    verifyPasswordResetCode(auth, code)
      .then(() => {
        setOobCode(code);
        setValidatingCode(false);
      })
      .catch((error) => {
        console.error('驗證重設碼失敗:', error);
        setError('此重設連結已失效或已被使用');
        setValidatingCode(false);
      });
  }, [location]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('密碼與確認密碼不符');
    }

    if (password.length < 6) {
      return setError('密碼長度至少需要6個字元');
    }

    try {
      setError('');
      setLoading(true);
      await confirmPasswordReset(auth, oobCode, password);
      alert('密碼重設成功！請使用新密碼登入。');
      navigate('/login');
    } catch (error) {
      console.error('重設密碼失敗:', error);
      switch (error.code) {
        case 'auth/expired-action-code':
          setError('重設連結已過期，請重新申請');
          break;
        case 'auth/invalid-action-code':
          setError('無效的重設連結，請重新申請');
          break;
        case 'auth/weak-password':
          setError('密碼強度不足，請使用更複雜的密碼');
          break;
        default:
          setError('重設密碼失敗，請稍後再試');
      }
    } finally {
      setLoading(false);
    }
  }

  if (validatingCode) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="text-lg mb-4">驗證中...</div>
            <div className="text-sm text-gray-600">
              請稍候，正在驗證您的重設連結
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !oobCode) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-blue-500 hover:text-blue-600"
            >
              重新申請密碼重設
            </button>
          </div>
        </div>
      </div>
    );
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

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              新密碼
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="confirmPassword"
            >
              確認新密碼
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? '重設中...' : '重設密碼'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          <ul className="list-disc list-inside space-y-1">
            <li>密碼長度至少需要6個字元</li>
            <li>建議使用字母、數字和符號的組合</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
