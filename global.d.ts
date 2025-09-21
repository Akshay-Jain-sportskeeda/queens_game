export {};

declare global {
  interface Window {
    adthrive?: {
      cmd: Array<() => void>;
      refresh: () => void;
    };
  }
}