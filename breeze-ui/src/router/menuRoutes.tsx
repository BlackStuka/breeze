import Dashboard from '@/features/dashboard/Dashboard'
import UserPage from '@/features/user/UserPage'
import RolePage from '@/features/role/RolePage'
import MenuPage from '@/features/menu/MenuPage'

export const pageRouteRegistry = {
	'/dashboard': Dashboard,
	'/system/user': UserPage,
	'/system/role': RolePage,
	'/system/menu': MenuPage,
} as const

export type RegisteredRoute = keyof typeof pageRouteRegistry
