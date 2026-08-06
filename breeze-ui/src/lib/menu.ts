import type { Menu } from '@/types'

export function resolveMenuPath(parent: string, path: string | null): string | null {
	if (!path) return null
	if (path.startsWith('/')) return path
	return `${parent}/${path}`.replace(/\/+/g, '/')
}

export function filterNavigableMenus(menus: Menu[], parentPath = ''): Menu[] {
	return menus.flatMap((menu) => {
		if (menu.status !== 1 || menu.visible !== 1 || menu.menuType === 'F') return []
		const path = resolveMenuPath(parentPath, menu.path)
		const children = filterNavigableMenus(menu.children ?? [], path ?? parentPath)
		if (menu.menuType === 'M') {
			return children.length ? [{ ...menu, children }] : []
		}
		return path ? [{ ...menu, children: children.length ? children : undefined }] : []
	})
}

export interface MenuRouteEntry {
	path: string
	menu: Menu
	ancestors: Menu[]
}

export function flattenMenuRoutes(menus: Menu[], parentPath = '', ancestors: Menu[] = []): MenuRouteEntry[] {
	return menus.flatMap((menu) => {
		if (menu.status !== 1 || menu.visible !== 1 || menu.menuType === 'F') return []
		const path = resolveMenuPath(parentPath, menu.path)
		if (!path) return flattenMenuRoutes(menu.children ?? [], parentPath, [...ancestors, menu])
		const currentAncestors = [...ancestors, menu]
		const current = menu.menuType === 'C' ? [{ path, menu, ancestors: currentAncestors }] : []
		return [...current, ...flattenMenuRoutes(menu.children ?? [], path, currentAncestors)]
	})
}

export function firstAccessiblePath(menus: Menu[]): string | null {
	return flattenMenuRoutes(menus)[0]?.path ?? null
}

