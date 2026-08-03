import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight, LogOut, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { http } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { Menu } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/** 菜单 path 解析:首页 /dashboard 绝对;子菜单 user 相对父 → /system/user */
function resolvePath(parent: string, path: string | null): string {
	if (!path) return '#'
	if (path.startsWith('/')) return path
	return `${parent}/${path}`.replace(/\/+/g, '/')
}

function SidebarItem({ menu, parentPath = '' }: { menu: Menu; parentPath?: string }) {
	const [open, setOpen] = useState(true)
	const location = useLocation()
	const path = resolvePath(parentPath, menu.path)

	if (menu.menuType === 'M' && menu.children?.length) {
		return (
			<div>
				<button
					type="button"
					onClick={() => setOpen((v) => !v)}
					className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent"
				>
					<span className="flex-1 text-left">{menu.menuName}</span>
					{open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
				</button>
				{open && (
					<div className="ml-3 border-l pl-1">
						{menu.children.map((c) => (
							<SidebarItem key={c.id} menu={c} parentPath={path} />
						))}
					</div>
				)}
			</div>
		)
	}
	const active = location.pathname === path
	return (
		<Link
			to={path}
			className={cn(
				'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent',
				active && 'bg-sidebar-accent font-medium',
			)}
		>
			<span>{menu.menuName}</span>
		</Link>
	)
}

export default function AppLayout() {
	const { data: menus } = useQuery({
		queryKey: ['menus', 'tree'],
		queryFn: () => http.get<Menu[]>('/menus/tree'),
	})
	const { user, clear } = useAuthStore()
	const navigate = useNavigate()
	const { theme, setTheme } = useTheme()

	const logout = async () => {
		try {
			await http.post('/auth/logout')
		} catch {
			/* 无状态 JWT,忽略 */
		}
		clear()
		navigate('/login')
	}

	return (
		<div className="flex h-svh overflow-hidden">
			<aside className="hidden w-56 shrink-0 flex-col border-r bg-sidebar md:flex">
				<div className="flex h-14 items-center border-b px-4 font-semibold">Breeze</div>
				<nav className="flex-1 space-y-1 overflow-auto p-2">
					{menus?.map((m) => (
						<SidebarItem key={m.id} menu={m} />
					))}
				</nav>
			</aside>
			<div className="flex flex-1 flex-col overflow-hidden">
				<header className="flex h-14 items-center justify-between border-b px-4">
					<span className="font-medium">Breeze 后台管理</span>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
						>
							<Sun className="hidden size-4 dark:block" />
							<Moon className="size-4 dark:hidden" />
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="gap-2">
									<Avatar className="size-7">
										<AvatarFallback>
											{user?.username?.[0]?.toUpperCase() ?? 'U'}
										</AvatarFallback>
									</Avatar>
									<span className="text-sm">{user?.nickname || user?.username}</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>{user?.username}</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={logout}>
									<LogOut className="mr-2 size-4" />
									退出登录
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</header>
				<main className="flex-1 overflow-auto p-4">
					<Outlet />
				</main>
			</div>
		</div>
	)
}
