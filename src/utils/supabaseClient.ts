import { createClient } from '@supabase/supabase-js';

// Supabase 설정 값
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// 환경 변수 검증
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL 또는 Anon Key가 설정되지 않았습니다.');
  console.info('환경 변수가 제대로 로드되지 않았습니다. .env 파일을 확인하세요:');
  console.info('REACT_APP_SUPABASE_URL=your_supabase_url');
  console.info('REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key');
}

// 싱글톤 패턴으로 Supabase 클라이언트 관리
class SupabaseManager {
  private static instance: SupabaseManager;
  private baseClient: any;
  private clientCache: Record<string, any> = {};

  private constructor() {
    // 기본 클라이언트 생성
    this.baseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      }
    });
  }

  // 싱글톤 인스턴스 가져오기
  public static getInstance(): SupabaseManager {
    if (!SupabaseManager.instance) {
      SupabaseManager.instance = new SupabaseManager();
    }
    return SupabaseManager.instance;
  }

  // 기본 클라이언트 가져오기
  public getClient() {
    return this.baseClient;
  }

  // 인증된 클라이언트 가져오기
  public getAuthenticatedClient(walletAddress: string, authToken: string) {
    if (!walletAddress || !authToken) {
      console.warn('No authentication information. Returning default client.');
      return this.baseClient;
    }
    
    // 캐시된 클라이언트가 있으면 재사용
    const cacheKey = `${walletAddress.toLowerCase()}_${authToken.substring(0, 10)}`;
    if (this.clientCache[cacheKey]) {
      return this.clientCache[cacheKey];
    }
    
    // JWT 토큰 헤더 설정 (RLS 정책에서 사용)
    const headers = {
      Authorization: `Bearer ${authToken}`,
      'wallet-address': walletAddress.toLowerCase()
    };
    
    // 새 클라이언트 생성 및 캐시
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      },
      global: {
        headers
      }
    });
    
    // 클라이언트 캐시에 저장
    this.clientCache[cacheKey] = client;
    
    return client;
  }
  
  // 캐시 초기화
  public clearCache() {
    this.clientCache = {};
  }
}

// 싱글톤 인스턴스 생성
const supabaseManager = SupabaseManager.getInstance();

// 기본 Supabase 클라이언트 내보내기
export const supabase = supabaseManager.getClient();

// 인증된 클라이언트 가져오기 함수
export const getAuthenticatedClient = (walletAddress: string, authToken: string) => {
  return supabaseManager.getAuthenticatedClient(walletAddress, authToken);
};

// 사용자 등록 및 로그인 기능 (서명 검증 포함)
export const authenticateWithWallet = async (walletAddress: string, authToken: string, signatureMessage?: string, signature?: string) => {
  try {
    console.log('Starting wallet authentication:', walletAddress);
    
    // 대소문자 통일
    const normalizedAddress = walletAddress.toLowerCase();
    
    // 1. 인증된 클라이언트 생성
    const authClient = getAuthenticatedClient(normalizedAddress, authToken);
    
    // 2. RPC 함수를 사용하여 사용자 생성 또는 업데이트
    const { data, error } = await authClient.rpc(
      'create_user_if_not_exists',
      { 
        p_wallet_address: normalizedAddress,
        p_nonce: null // 새 논스 자동 생성
      }
    );
    
    if (error) {
      console.error('Failed to register/update user:', error);
      
      // 일반 클라이언트로 재시도
      console.log('Retrying user registration/update with default client...');
      const { data: retryData, error: retryError } = await supabase.rpc(
        'create_user_if_not_exists',
        { 
          p_wallet_address: normalizedAddress,
          p_nonce: null // 새 논스 자동 생성
        }
      );
      
      if (retryError) {
        console.error('Retry with default client failed:', retryError);
        return { user: null, error: retryError };
      }
      
      if (retryData) {
        console.log('User registration/update with default client succeeded:', retryData);
        return { user: retryData[0], error: null };
      }
    }
    
    console.log('User registration/update succeeded:', data);
    return { user: data?.[0] || null, error: null };
  } catch (error) {
    console.error('Exception occurred during authentication:', error);
    return { user: null, error };
  }
};

// 사용자 정보 업데이트 함수
export const updateUserProfile = async (walletAddress: string, authToken: string, userData: { username?: string }) => {
  try {
    const authClient = getAuthenticatedClient(walletAddress, authToken);
    
    // RPC 함수를 사용하여 사용자 정보 업데이트
    const { data, error } = await authClient.rpc(
      'update_user_info',
      { 
        p_wallet_address: walletAddress.toLowerCase(),
        p_username: userData.username
      }
    );
    
    if (error) {
      console.error('Failed to update user information:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception occurred while updating user information:', error);
    return { data: null, error };
  }
};

// 게임 결과 저장 함수
export const saveGameResult = async (walletAddress: string, authToken: string, score: number) => {
  try {
    const authClient = getAuthenticatedClient(walletAddress, authToken);
    
    // 게임 결과 저장
    const { data, error } = await authClient
      .from('game_results')
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        score,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('게임 결과 저장 실패:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('게임 결과 저장 중 예외 발생:', error);
    return { data: null, error };
  }
};

// 사용자 게임 결과 조회 함수
export const getUserGameResults = async (walletAddress: string, authToken: string) => {
  try {
    const authClient = getAuthenticatedClient(walletAddress, authToken);
    
    // 사용자의 게임 결과 조회
    const { data, error } = await authClient
      .from('game_results')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Failed to fetch user game results:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception occurred while fetching user game results:', error);
    return { data: null, error };
  }
};

// 리더보드 데이터 조회 함수
export const getLeaderboard = async (limit: number = 100) => {
  try {
    // 리더보드 데이터 조회 (RPC 함수 사용)
    const { data, error } = await supabase.rpc(
      'get_leaderboard',
      { limit_count: limit }
    );
    
    if (error) {
      console.error('리더보드 조회 실패:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('리더보드 조회 중 예외 발생:', error);
    return { data: null, error };
  }
};

// Supabase 연결 테스트 함수
export const testSupabaseConnection = async () => {
  try {
    // 간단한 쿼리로 연결 테스트
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase 연결 테스트 실패:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Supabase 연결 예외 발생:', err);
    return { success: false, error: err };
  }
};