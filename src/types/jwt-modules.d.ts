declare module 'jwt-encode' {
  export default function encode(payload: any, secret: string): string;
}

declare module 'jwt-decode' {
  export default function decode<T = any>(token: string, options?: any): T;
}

declare module 'process/browser' {
  const process: {
    env: Record<string, string | undefined>;
    nextTick: (callback: (...args: any[]) => void, ...args: any[]) => void;
    [key: string]: any;
  };
  export default process;
} 