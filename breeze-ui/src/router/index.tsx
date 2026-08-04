import { createBrowserRouter, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import AppLayout from '@/features/layout/AppLayout'
import LoginPage from '@/features/auth/LoginPage'
import UserPage from '@/features/user/UserPage'
import RolePage from '@/features/role/RolePage'
import MenuPage from '@/features/menu/MenuPage'
import { useAuthStore } from '@/store/auth'

function RequireAuth({ children }: { children: ReactNode }) {
	const token = useAuthStore((s) => s.token)
	if (!token) return <Navigate to="/login" replace />
	return <>{children}</>
}

function Dashboard() {
	return (
		<div className="flex flex-col gap-2">
			<h1 className="text-2xl font-semibold">首页</h1>
			<p className="text-muted-foreground">Breeze 后台管理 · 试试左侧菜单进入各管理页。</p>
		</div>
	)
}

export const router = createBrowserRouter([
	{ path: '/login', element: <LoginPage /> },
	{
		path: '/',
		element: (
			<RequireAuth>
				<AppLayout />
			</RequireAuth>
		),
		children: [
			{ index: true, element: <Navigate to="/dashboard" replace /> },
			{ path: 'dashboard', element: <Dashboard /> },
			{ path: 'system/user', element: <UserPage /> },
			{ path: 'system/role', element: <RolePage /> },
			{ path: 'system/menu', element: <MenuPage /> },
		],
	},
	{ path: '*', element: <Navigate to="/" replace /> },
])
