import {
	Home,
	Settings,
	Users,
	Shield,
	Menu as MenuIcon,
	LayoutDashboard,
	type LucideIcon,
} from 'lucide-react'

/**
 * DB sys_menu.icon 存的是 lucide 图标名(首字母大写,如 'Users')。
 * 显式映射 name → 组件,保证 tree-shaking 友好、bundle 可控
 * (避免 `import * as Icons` 把整个 lucide 打进来)。
 * 新增菜单用了新图标?在此补一行即可。
 */
export const menuIcons: Record<string, LucideIcon> = {
	Home,
	Settings,
	Users,
	Shield,
	Menu: MenuIcon, // 'Menu' 与组件名同名,这里重命名
	LayoutDashboard,
}

/** 未命中映射时的兜底图标。 */
export const fallbackMenuIcon: LucideIcon = LayoutDashboard
