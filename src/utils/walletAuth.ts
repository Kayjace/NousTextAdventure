import { ethers } from 'ethers';
import { supabase } from './supabaseClient';
import encode from 'jwt-encode';
import decode from 'jwt-decode';

// Supabase JWT 키 (실제 환경에서는 환경 변수로 설정)
const JWT_SECRET = process.env.REACT_APP_SUPABASE_JWT_SECRET || '';

// 논스 가져오기 함수
export const getNonce = async (walletAddress: string): Promise<string> => {
  try {
    // 1. RPC 함수를 사용하여 사용자가 존재하지 않으면 생성하고 논스 가져오기
    const { data, error } = await supabase.rpc(
      'create_user_if_not_exists',
      { p_wallet_address: walletAddress.toLowerCase() }
    );

    if (error) {
      console.error('Failed to fetch/create user information:', error);
      // 오류 발생 시 임시 논스 생성
      return Math.floor(Math.random() * 1000000).toString();
    }

    // 2. 반환된 사용자 데이터에서 논스 추출
    if (data && data.length > 0 && data[0].nonce) {
      return data[0].nonce;
    } else {
      console.warn('No nonce found. Generating temporary nonce.');
      return Math.floor(Math.random() * 1000000).toString();
    }
  } catch (err) {
    console.error('Error occurred while fetching nonce:', err);
    // 오류 발생 시 임시 논스 생성
    return Math.floor(Math.random() * 1000000).toString();
  }
};

// 서명 메시지 생성 함수
export const generateSignMessage = (address: string, nonce: string): string => {
  const timestamp = Date.now();
  return `Welcome to Nous Text Adventure!\n\nThis signature is used to verify you are the owner of this address: ${address}\n\nNonce: ${nonce}\nTimestamp: ${timestamp}\n\nThis signature does not cost any gas fees and does not authorize any transactions.`;
};

// 서명 검증 함수
export const verifySignature = (message: string, signature: string, expectedAddress: string): boolean => {
  try {
    // 서명으로부터 주소 복구
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    // 복구된 주소와 기대 주소 비교 (대소문자 무시)
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('서명 검증 오류:', error);
    return false;
  }
};

// 서명 타임스탬프 검증 - 서명 요청 후 5분 이내인지 확인
export const isValidSignatureTimestamp = (signatureMessage: string): boolean => {
  try {
    // 타임스탬프 추출
    const match = signatureMessage.match(/Timestamp: (\d+)/);
    if (!match || !match[1]) return false;
    
    const timestamp = parseInt(match[1], 10);
    const now = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000;
    
    return (now - timestamp) <= fiveMinutesInMs;
  } catch (e) {
    console.error('타임스탬프 검증 오류:', e);
    return false;
  }
};

// JWT 토큰 생성 함수
export const createAuthToken = (address: string): string => {
  // JWT 페이로드 (RLS 정책에서 사용할 address 필드 포함)
  const payload = { 
    address: address.toLowerCase(), // RLS 정책에서 사용하는 값
    aud: 'authenticated',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24시간 유효
  };
  
  // JWT 토큰 생성 (jwt-encode 사용)
  return encode(payload, JWT_SECRET);
};

// 사용자 정보 업데이트 함수
export const updateUserProfile = async (walletAddress: string, username: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc(
      'update_user_info',
      { 
        p_wallet_address: walletAddress.toLowerCase(),
        p_username: username
      }
    );

    if (error) {
      console.error('Failed to update user information:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error occurred while updating user information:', err);
    return false;
  }
};

// 리더보드 데이터 조회 함수
export const getLeaderboard = async (limit: number = 100): Promise<any[]> => {
  try {
    const { data, error } = await supabase.rpc(
      'get_leaderboard',
      { limit_count: limit }
    );

    if (error) {
      console.error('리더보드 조회 실패:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('리더보드 조회 중 오류 발생:', err);
    return [];
  }
};

// 로컬 스토리지에서 인증 정보 저장 함수
export const saveAuthInfo = (walletAddress: string, signature: string, authToken: string): void => {
  localStorage.setItem('current_wallet_address', walletAddress.toLowerCase());
  localStorage.setItem(`signature_${walletAddress.toLowerCase()}`, signature);
  localStorage.setItem(`auth_token_${walletAddress.toLowerCase()}`, authToken);
  localStorage.setItem(`signature_verified_${walletAddress.toLowerCase()}`, 'true');
};

// 로컬 스토리지에서 인증 상태 확인 함수
export const checkAuthenticationStatus = (): { isAuthenticated: boolean; walletAddress: string | null } => {
  try {
    // 현재 지갑 주소 확인
    const walletAddress = localStorage.getItem('current_wallet_address');
    
    if (!walletAddress) {
      return { isAuthenticated: false, walletAddress: null };
    }
    
    // 인증 상태 확인
    const signature = localStorage.getItem(`signature_${walletAddress}`);
    const authToken = localStorage.getItem(`auth_token_${walletAddress}`);
    const verified = localStorage.getItem(`signature_verified_${walletAddress}`);
    
    if (signature && authToken && verified === 'true') {
      return { isAuthenticated: true, walletAddress };
    }
    
    return { isAuthenticated: false, walletAddress };
  } catch (error) {
    console.error('인증 상태 확인 중 오류 발생:', error);
    return { isAuthenticated: false, walletAddress: null };
  }
};

// 인증 정보 초기화 함수
export const clearAuthenticationData = (walletAddress?: string) => {
  try {
    if (walletAddress) {
      // 특정 지갑 주소에 대한 인증 정보만 삭제
      localStorage.removeItem(`signature_${walletAddress.toLowerCase()}`);
      localStorage.removeItem(`auth_token_${walletAddress.toLowerCase()}`);
      localStorage.removeItem(`signature_verified_${walletAddress.toLowerCase()}`);
      localStorage.removeItem(`username_${walletAddress.toLowerCase()}`);
      
      // 현재 지갑 주소가 삭제하려는 주소와 같은 경우에만 삭제
      const currentAddress = localStorage.getItem('current_wallet_address');
      if (currentAddress && currentAddress.toLowerCase() === walletAddress.toLowerCase()) {
        localStorage.removeItem('current_wallet_address');
      }
    } else {
      // 현재 지갑 주소 확인
      const currentAddress = localStorage.getItem('current_wallet_address');
      
      // 모든 인증 정보 삭제
      localStorage.removeItem('current_wallet_address');
      
      if (currentAddress) {
        localStorage.removeItem(`signature_${currentAddress.toLowerCase()}`);
        localStorage.removeItem(`auth_token_${currentAddress.toLowerCase()}`);
        localStorage.removeItem(`signature_verified_${currentAddress.toLowerCase()}`);
        localStorage.removeItem(`username_${currentAddress.toLowerCase()}`);
      }
    }
  } catch (error) {
    console.error('인증 정보 초기화 중 오류 발생:', error);
  }
}; 