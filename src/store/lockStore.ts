import { create } from 'zustand'

interface LockStore {
  isLocked: boolean
  lock: () => void
  unlock: () => void
}

export const useLockStore = create<LockStore>((set) => ({
  isLocked: true,   // start locked on boot
  lock: () => set({ isLocked: true }),
  unlock: () => set({ isLocked: false }),
}))
