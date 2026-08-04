import { Fragment } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { ChevronDown, LogOut, Moon, Sun, Wind } from 'lucide-react'
import { Collapsible as CollapsiblePrimitive } from 'radix-ui'
import { useTheme } from 'next-themes'
import { http } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { Menu } from '@/types'
import { menuIcons, fallbackMenuIcon } from '@/lib/menuIcons'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarTrigger,
	useSidebar,
} from '@/components/ui/sidebar'

/** 路由 → 面包屑段(首页固定在最前,这里只列首页之后的层级)。动态菜单的路由目前固定,轻量映射。 */
const routeCrumbs: Record<string, string[]> = {
	'/system/user': ['系统管理', '用户管理'],
	'/system/role': ['系统管理', '角色管理'],
	'/system/menu': ['系统管理', '菜单管理'],
}

/** 菜单 path 解析:首页 /dashboard 绝对;子菜单 user 相对父 → /system/user */
function resolvePath(parent: string, path: string | null): string {
	if (!path) return '#'
	if (path.startsWith('/')) return path
	return `${parent}/${path}`.replace(/\/+/g, '/')
}

type Location = ReturnType<typeof useLocation>

/**
 * 递归渲染菜单节点。
 * - 目录(M 且有 children):Collapsible 展开,子级进 SidebarMenuSub。
 * - 叶子(C):Link,active 用 isActive。
 * - F(按钮)类不在导航树渲染;若后端 tree 含 F,会被当叶子兜底(与旧版一致)。
 * nested 控制用 SidebarMenuItem/MenuButton 还是 Sub 系列(li/样式不同)。
 */
function MenuNode({
	menu,
	parentPath = '',
	nested = false,
	location,
	onNavigate,
}: {
	menu: Menu
	parentPath?: string
	nested?: boolean
	location: Location
	onNavigate?: () => void
}) {
	const path = resolvePath(parentPath, menu.path)
	const Icon = menuIcons[menu.icon ?? ''] ?? fallbackMenuIcon
	const active = location.pathname === path

	if (menu.menuType === 'M' && menu.children?.length) {
		const DirItem = nested ? SidebarMenuSubItem : SidebarMenuItem
		return (
			<CollapsiblePrimitive.Root asChild defaultOpen className="group/collapsible">
				<DirItem>
					<CollapsiblePrimitive.Trigger asChild>
						<SidebarMenuButton tooltip={menu.menuName}>
							<Icon />
							<span>{menu.menuName}</span>
							<ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
						</SidebarMenuButton>
					</CollapsiblePrimitive.Trigger>
					<CollapsiblePrimitive.Content>
						<SidebarMenuSub>
							{menu.children.map((c) => (
								<MenuNode
									key={c.id}
									menu={c}
									parentPath={path}
									nested
									location={location}
									onNavigate={onNavigate}
								/>
							))}
						</SidebarMenuSub>
					</CollapsiblePrimitive.Content>
				</DirItem>
			</CollapsiblePrimitive.Root>
		)
	}

	if (nested) {
		return (
			<SidebarMenuSubItem>
				<SidebarMenuSubButton asChild isActive={active}>
					<Link to={path} onClick={onNavigate}>
						<Icon />
						<span>{menu.menuName}</span>
					</Link>
				</SidebarMenuSubButton>
			</SidebarMenuSubItem>
		)
	}

	return (
		<SidebarMenuItem>
			<SidebarMenuButton asChild isActive={active} tooltip={menu.menuName}>
				<Link to={path} onClick={onNavigate}>
					<Icon />
					<span>{menu.menuName}</span>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	)
}

function SidebarNav({ menus, location }: { menus: Menu[]; location: Location }) {
	const { setOpenMobile } = useSidebar()
	return (
		<SidebarMenu>
			{menus.map((m) => (
				<MenuNode
					key={m.id}
					menu={m}
					location={location}
					onNavigate={() => setOpenMobile(false)}
				/>
			))}
		</SidebarMenu>
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
	const location = useLocation()

	const logout = async () => {
		try {
			await http.post('/auth/logout')
		} catch {
			/* 无状态 JWT,忽略 */
		}
		clear()
		navigate('/login')
	}

	const isHome = location.pathname === '/dashboard'
	const subCrumbs = routeCrumbs[location.pathname] ?? []

	return (
		<SidebarProvider>
			<Sidebar collapsible="icon">
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton size="lg" tooltip="Breeze">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
									<Wind className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">Breeze</span>
									<span className="truncate text-xs text-muted-foreground">后台管理</span>
								</div>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarNav menus={menus ?? []} location={location} />
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>

			<SidebarInset>
				<header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
					<SidebarTrigger />
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								{isHome ? (
									<BreadcrumbPage>首页</BreadcrumbPage>
								) : (
									<BreadcrumbLink asChild>
										<Link to="/dashboard">首页</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
							{subCrumbs.map((name, i) => (
								<Fragment key={name}>
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										{i === subCrumbs.length - 1 ? (
											<BreadcrumbPage>{name}</BreadcrumbPage>
										) : (
											<span>{name}</span>
										)}
									</BreadcrumbItem>
								</Fragment>
							))}
						</BreadcrumbList>
					</Breadcrumb>
					<div className="ml-auto flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
							onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
						>
							<Sun className="hidden dark:block" />
							<Moon className="dark:hidden" />
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
									<LogOut className="size-4" />
									退出登录
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</header>
				<div className="flex-1 overflow-auto p-6">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
