/// <reference types="vite/client" />
declare const __APP_VERSION__: string

// Wake Lock API types (not yet in lib.dom.d.ts for all TS versions)
interface WakeLockSentinel {
  released: boolean
  release(): Promise<void>
  addEventListener(type: string, listener: () => void): void
}
declare global {
  interface Navigator {
    wakeLock: { request(type: string): Promise<WakeLockSentinel> }
  }
}
