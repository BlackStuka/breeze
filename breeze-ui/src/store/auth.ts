import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserInfo } from '@/types'

interface AuthState {
	token: string | null
	user: UserInfo | null
	authorities: string[]
	setAuth: (token: string, user: UserInfo, authorities: string[]) => void
	clear: () => void
	hasAuthority: (code: string) => boolean
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			token: null,
			user: null,
			authorities: [],
			setAuth: (token, user, authorities) => set({ token, user, authorities }),
			clear: () => set({ token: null, user: null, authorities: [] }),
			hasAuthority: (code) => get().authorities.includes(code),
		}),
		{ name: 'breeze-auth' },
	),
)
