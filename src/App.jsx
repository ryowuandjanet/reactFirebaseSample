import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import VerifyEmail from './components/VerifyEmail';

// 保護路由組件
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  // 檢查用戶是否已登入且郵件已驗證
  if (!currentUser || !currentUser.emailVerified) {
    // 將嘗試訪問的 URL 保存在重定向中
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppContent() {
  const { currentUser } = useAuth();
  const location = useLocation();

  const noNavbarPaths = [
    '/login',
    '/register',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
  ];
  const shouldShowNavbar =
    currentUser && !noNavbarPaths.includes(location.pathname);

  return (
    <div className="font-noto min-h-screen bg-gray-50">
      {shouldShowNavbar && <Navbar />}
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/login"
            element={
              currentUser?.emailVerified ? <Navigate to="/" /> : <Login />
            }
          />
          <Route
            path="/register"
            element={
              currentUser?.emailVerified ? <Navigate to="/" /> : <Register />
            }
          />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
