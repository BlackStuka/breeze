import { createBrowserRouter, Navigate, useLocation, useNavigation } from 'react-router-dom'
import type { ReactNode } from 'react'
import AppLayout from '@/features/layout/AppLayout'
import LoginPage from '@/features/auth/LoginPage'
import ForbiddenPage from '@/features/error/ForbiddenPage'
import NotFoundPage from '@/features/error/NotFoundPage'
import { MenuTreeError, MenuTreeLoading } from '@/components/MenuTreeState'
import { useMenuTree } from '@/hooks/useMenuTree'
import { pageRouteRegistry } from '@/router/menuRoutes'
import { useAuthStore } from '@/store/auth'

function RequireAuth({ children }: { children: ReactNode }) {
	const token = useAuthStore((s) => s.token)
	const location = useLocation()
	if (!token) {
		const redirect = `${location.pathname}${location.search}`
		if (redirect !== '/login') sessionStorage.setItem('breeze-login-redirect', redirect)
		return <Navigate to="/login" replace />
	}
	return <>{children}</>
}

function RouteAccess({ path, children }: { path: string; children: ReactNode }) {
	const { routes, isLoading, isError, refetch } = useMenuTree()
	const navigation = useNavigation()
	if (isLoading || navigation.state === 'loading') return <MenuTreeLoading />
	if (isError) return <MenuTreeError onRetry={() => void refetch()} />
	if (!routes.length) return <ForbiddenPage />
	if (!routes.some((entry) => entry.path === path)) return <ForbiddenPage />
	return <>{children}</>
}

function RootRedirect() {
	const { firstPath, isLoading, isError, refetch } = useMenuTree()
	if (isLoading) return <MenuTreeLoading />
	if (isError) return <MenuTreeError onRetry={() => void refetch()} />
	return <Navigate to={firstPath ?? '/403'} replace />
}

const protectedRoutes = Object.entries(pageRouteRegistry).map(([path, Component]) => ({
	path: path.replace(/^\//, ''),
	element: <RouteAccess path={path}><Component /></RouteAccess>,
}))

export const router = createBrowserRouter([
	{ path: '/login', element: <LoginPage /> },
	{ path: '/403', element: <ForbiddenPage /> },
	{ path: '/404', element: <NotFoundPage /> },
	{
		path: '/',
		element: <RequireAuth><AppLayout /></RequireAuth>,
		children: [{ index: true, element: <RootRedirect /> }, ...protectedRoutes],
	},
	{ path: '*', element: <NotFoundPage /> },
])
