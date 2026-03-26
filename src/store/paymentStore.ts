import { create } from 'zustand'

type PaymentStatus = 'idle' | 'pending' | 'success' | 'failed'

interface PaymentState {
  status: PaymentStatus
  phone: string
  amount: number
  simulateSTK: (phone: string, amount: number) => Promise<boolean>
  reset: () => void
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

export const usePaymentStore = create<PaymentState>((set) => ({
  status: 'idle',
  phone: '',
  amount: 0,

  simulateSTK: async (phone: string, amount: number) => {
    set({ status: 'pending', phone, amount })
    await delay(4000)
    const success = Math.random() > 0.1
    set({ status: success ? 'success' : 'failed' })
    return success
  },

  reset: () => set({ status: 'idle', phone: '', amount: 0 }),
}))
