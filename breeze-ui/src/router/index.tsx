import { createBrowserRouter, Navigate, useLocation, useNavigation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import AppLayout from '@/features/layout/AppLayout'
import LoginPage from '@/features/auth/LoginPage'
import ForbiddenPage from '@/features/error/ForbiddenPage'
import NotFoundPage from '@/features/error/NotFoundPage'
import { http } from '@/lib/api'
import { flattenMenuRoutes, firstAccessiblePath } from '@/lib/menu'
import { pageRouteRegistry } from '@/router/menuRoutes'
import { useAuthStore } from '@/store/auth'
import type { Menu } from '@/types'

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
	const { data: menus, isLoading, isError } = useQuery({
		queryKey: ['menus', 'tree'],
		queryFn: () => http.get<Menu[]>('/menus/tree'),
	})
	const navigation = useNavigation()
	if (isLoading || navigation.state === 'loading') {
		return <div className="flex min-h-64 items-center justify-center text-muted-foreground">加载中…</div>
	}
	if (isError) {
		return <div className="flex min-h-64 items-center justify-center text-muted-foreground">菜单加载失败，请刷新重试。</div>
	}
	const routes = flattenMenuRoutes(menus ?? [])
	if (!routes.some((entry) => entry.path === path)) return <ForbiddenPage />
	return <>{children}</>
}

function RootRedirect() {
	const { data: menus, isLoading } = useQuery({
		queryKey: ['menus', 'tree'],
		queryFn: () => http.get<Menu[]>('/menus/tree'),
	})
	if (isLoading) return <div className="flex min-h-64 items-center justify-center text-muted-foreground">加载中…</div>
	return <Navigate to={firstAccessiblePath(menus ?? []) ?? '/403'} replace />
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
		element: (
			<RequireAuth>
				<AppLayout />
			</RequireAuth>
		),
		children: [
			{ index: true, element: <RootRedirect /> },
			...protectedRoutes,
		],
	},
	{ path: '*', element: <NotFoundPage /> },
])
