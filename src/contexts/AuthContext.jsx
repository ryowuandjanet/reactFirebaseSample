import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
} from '../firebase';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password) {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      // 立即發送驗證郵件
      await sendEmailVerification(result.user);
      // 設置當前用戶
      setCurrentUser(result.user);
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // 檢查電子郵件是否已驗證
      if (!result.user.emailVerified) {
        // 如果未驗證，立即登出
        await signOut(auth);
        setCurrentUser(null);
        // 使用明確的錯誤訊息
        const error = new Error('請先驗證您的電子郵件後再登入');
        error.code = 'auth/email-not-verified'; // 添加自定義錯誤代碼
        throw error;
      }

      setCurrentUser(result.user);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      // 如果是原始的 Firebase 錯誤，重新包裝它
      if (error.code === 'auth/invalid-credential') {
        throw new Error('電子郵件或密碼錯誤');
      }
      // 直接拋出我們的自定義錯誤
      throw error;
    }
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // 修改這裡：不要在這裡自動登出未驗證的用戶
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
