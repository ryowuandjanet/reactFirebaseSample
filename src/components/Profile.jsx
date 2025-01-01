import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ref, get, set } from 'firebase/database';
import { realtimeDb } from '../firebase';

function Profile() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    displayName: '',
    phoneNumber: '',
    address: '',
  });

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    loadUserProfile();
  }, [currentUser]);

  async function loadUserProfile() {
    try {
      setLoading(true);
      setError('');

      if (!currentUser?.uid) {
        throw new Error('找不到使用者ID');
      }

      const userRef = ref(realtimeDb, `userList/${currentUser.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        setProfileData({
          displayName: data.displayName || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || '',
          updatedAt: data.updatedAt,
        });
      } else {
        const initialData = {
          displayName: '',
          phoneNumber: '',
          address: '',
          email: currentUser.email,
          createdAt: new Date().toISOString(),
        };
        await set(userRef, initialData);
        setProfileData(initialData);
      }
    } catch (err) {
      console.error('載入個人資料失敗:', err);
      setError(`載入個人資料時發生錯誤: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    try {
      if (!currentUser?.uid) {
        throw new Error('找不到使用者ID');
      }

      const userRef = ref(realtimeDb, `userList/${currentUser.uid}`);
      const updatedData = {
        ...profileData,
        email: currentUser.email,
        updatedAt: new Date().toISOString(),
      };

      await set(userRef, updatedData);
      setSuccess('個人資料更新成功！');
      setProfileData((prev) => ({ ...prev, updatedAt: updatedData.updatedAt }));
    } catch (err) {
      console.error('更新個人資料失敗:', err);
      setError(`更新個人資料時發生錯誤: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-lg text-red-600">請先登入</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">個人資料</h2>

        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">系統資訊</h3>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between">
              <span className="text-gray-600">ID:</span>
              <span className="text-gray-800">{currentUser.uid}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">驗證提供者:</span>
              <span className="text-gray-800">
                {currentUser.providerData
                  ?.map((provider) => provider.providerId)
                  .join(', ') || '無資料'}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">建立日期:</span>
              <span className="text-gray-800">
                {currentUser.metadata?.creationTime
                  ? new Date(currentUser.metadata.creationTime).toLocaleString(
                      'zh-TW',
                    )
                  : '無資料'}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">最後登入:</span>
              <span className="text-gray-800">
                {currentUser.metadata?.lastSignInTime
                  ? new Date(
                      currentUser.metadata.lastSignInTime,
                    ).toLocaleString('zh-TW')
                  : '無資料'}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">使用者 UID:</span>
              <span className="text-gray-800 break-all">{currentUser.uid}</span>
            </p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">電子郵件</h3>
          <p className="text-gray-800">{currentUser.email}</p>
          <p className="text-sm text-gray-600 mt-1">
            驗證狀態：
            <span
              className={
                currentUser.emailVerified ? 'text-green-600' : 'text-red-600'
              }
            >
              {currentUser.emailVerified ? '已驗證' : '未驗證'}
            </span>
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="displayName"
            >
              顯示名稱
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              value={profileData.displayName}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="phoneNumber"
            >
              電話號碼
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              value={profileData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="address"
            >
              地址
            </label>
            <textarea
              id="address"
              name="address"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              rows="3"
              value={profileData.address}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className={`w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline ${
              updating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {updating ? '更新中...' : '更新個人資料'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            上次更新時間：
            {profileData.updatedAt
              ? new Date(profileData.updatedAt).toLocaleString('zh-TW')
              : '尚未更新'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
