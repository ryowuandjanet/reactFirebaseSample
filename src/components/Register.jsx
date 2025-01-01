import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ref, set } from 'firebase/database';
import { realtimeDb } from '../firebase';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('密碼不一致');
    }

    try {
      setError('');
      setLoading(true);
      const result = await signup(email, password);

      if (result.user) {
        const userRef = ref(realtimeDb, `userList/${result.user.uid}`);
        const userData = {
          id: result.user.uid,
          authProviders: result.user.providerData.map(
            (provider) => provider.providerId,
          ),
          password: password,
          createdAt: result.user.metadata.creationTime,
          lastLoginAt: result.user.metadata.lastSignInTime,
          uid: result.user.uid,
          email: result.user.email,
          emailVerified: result.user.emailVerified,
          displayName: '',
          phoneNumber: '',
          address: '',
        };

        await set(userRef, userData);
        navigate('/verify-email', { replace: true });
      }
    } catch (error) {
      console.error('註冊錯誤:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('此電子郵件已被使用');
          break;
        case 'auth/invalid-email':
          setError('無效的電子郵件格式');
          break;
        case 'auth/operation-not-allowed':
          setError('此註冊方式目前不可用');
          break;
        case 'auth/weak-password':
          setError('密碼強度不足，請使用至少6個字元');
          break;
        default:
          setError('註冊失敗: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">註冊</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              密碼
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
              htmlFor="password-confirm"
            >
              確認密碼
            </label>
            <input
              id="password-confirm"
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
            {loading ? '註冊中...' : '註冊'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            已經有帳號了？{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-600">
              點此登入
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
