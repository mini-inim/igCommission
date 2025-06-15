import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Firebase 설정 파일에서 db import

const AuthPage = () => {
  const { login, signup, loading, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); 
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  // Firestore에 사용자 문서 생성 함수
  const createUserDocument = async (user, displayName = '') => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: displayName || user.displayName || '',
          gold: 1000, // 초기 골드 지급
          level: 1,
          exp: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: new Date()
        });
        console.log('새 사용자 문서가 생성되었습니다.');
      } else {
        // 기존 사용자라면 마지막 로그인 시간만 업데이트
        await setDoc(userRef, {
          lastLogin: new Date(),
          updatedAt: new Date()
        }, { merge: true });
        console.log('기존 사용자 로그인 정보가 업데이트되었습니다.');
      }
    } catch (error) {
      console.error('사용자 문서 생성/업데이트 오류:', error);
      throw error;
    }
  };

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setLocalLoading(true);
    try {
      if (isLogin) {
        // 로그인
        const result = await login(email, password);
        // 로그인 성공 후 사용자 문서 확인/생성
        await createUserDocument(result.user);
      } else {
        // 회원가입
        const result = await signup(email, password);
        
        // Firebase Auth 프로필 업데이트
        await updateProfile(result.user, {
          displayName: name,
        });
        
        // Firestore에 사용자 문서 생성
        await createUserDocument(result.user, name);
      }
      
      // 성공 메시지
      alert(isLogin ? '로그인 성공!' : '회원가입이 완료되었습니다!');
      
    } catch (err) {
      console.error('인증 오류:', err);
      let errorMessage = '알 수 없는 오류가 발생했습니다.';
      
      // Firebase 오류 메시지 한국어로 변환
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = '존재하지 않는 사용자입니다.';
          break;
        case 'auth/wrong-password':
          errorMessage = '비밀번호가 틀렸습니다.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = '이미 사용 중인 이메일입니다.';
          break;
        case 'auth/weak-password':
          errorMessage = '비밀번호는 6자 이상이어야 합니다.';
          break;
        case 'auth/invalid-email':
          errorMessage = '유효하지 않은 이메일 주소입니다.';
          break;
        case 'auth/too-many-requests':
          errorMessage = '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
          break;
        default:
          errorMessage = err.message || '오류가 발생했습니다.';
      }
      
      alert(`오류: ${errorMessage}`);
    } finally {
      setLocalLoading(false);
    }
  };

  // Enter 키로 로그인/회원가입 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAuth();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">게임 포털</h1>
          <p className="text-white/70">
            {isLogin ? '계정에 로그인하세요' : '새 계정을 만드세요'}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <input
                  type="text"
                  placeholder="이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type="email"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleAuth}
            disabled={localLoading || loading}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(localLoading || loading) ? '처리중...' : (isLogin ? '로그인' : '회원가입')}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            disabled={localLoading || loading}
            className="text-white/70 hover:text-white transition-colors disabled:opacity-50"
          >
            {isLogin ? '계정이 없나요? 회원가입' : '이미 계정이 있나요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;