// Global type definitions
interface Window {
  ethereum?: any;
  Buffer: typeof Buffer;
  process: any; // 간단하게 any로 처리
}

// 글로벌 네임스페이스 확장
declare global {
  interface Window {
    ethereum?: any;
    Buffer: typeof Buffer;
    process: any;
  }
} 