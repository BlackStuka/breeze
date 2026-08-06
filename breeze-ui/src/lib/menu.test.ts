import { describe, expect, it } from 'vitest'
import type { Menu } from '@/types'
import { filterNavigableMenus, flattenMenuRoutes, firstAccessiblePath, resolveMenuPath } from './menu'

function menu(overrides: Partial<Menu> = {}): Menu {
	return {
		id: '1',
		parentId: '0',
		menuName: '页面',
		menuType: 'C',
		path: '/page',
		component: 'page/index',
		perms: null,
		icon: null,
		sort: 1,
		visible: 1,
		status: 1,
		...overrides,
	}
}

describe('resolveMenuPath', () => {
	it('keeps absolute paths and resolves child paths', () => {
		expect(resolveMenuPath('', '/dashboard')).toBe('/dashboard')
		expect(resolveMenuPath('/system', 'user')).toBe('/system/user')
		expect(resolveMenuPath('/system/', '/system/role')).toBe('/system/role')
	})

	it('returns null for an empty path', () => {
		expect(resolveMenuPath('/system', null)).toBeNull()
		expect(resolveMenuPath('/system', '')).toBeNull()
	})
})

describe('filterNavigableMenus', () => {
	it('removes buttons, hidden, disabled and pathless nodes', () => {
		const result = filterNavigableMenus([
			menu({ id: 'button', menuType: 'F', path: null }),
			menu({ id: 'hidden', visible: 0 }),
			menu({ id: 'disabled', status: 0 }),
			menu({ id: 'pathless', path: null }),
			menu({ id: 'valid', path: '/valid' }),
		])

		expect(result.map((item) => item.id)).toEqual(['valid'])
	})

	it('keeps directories only when they have navigable children', () => {
		const result = filterNavigableMenus([
			menu({ id: 'empty-dir', menuType: 'M', path: '/empty', children: [] }),
			menu({
				id: 'system',
				menuType: 'M',
				path: '/system',
				children: [menu({ id: 'user', path: 'user' }), menu({ id: 'button', menuType: 'F', path: null })],
			}),
		])

		expect(result).toHaveLength(1)
		expect(result[0].id).toBe('system')
		expect(result[0].children?.map((item) => item.id)).toEqual(['user'])
	})
})

describe('flattenMenuRoutes', () => {
	it('returns accessible C routes with resolved paths and ancestors', () => {
		const result = flattenMenuRoutes([
			menu({ id: 'home', path: '/dashboard', menuName: '首页' }),
			menu({
				id: 'system',
				menuType: 'M',
				path: '/system',
				menuName: '系统管理',
				children: [menu({ id: 'user', path: 'user', menuName: '用户管理' })],
			}),
		])

		expect(result.map((item) => item.path)).toEqual(['/dashboard', '/system/user'])
		expect(result[1].ancestors.map((item) => item.menuName)).toEqual(['系统管理', '用户管理'])
	})

	it('ignores button and inactive routes', () => {
		const result = flattenMenuRoutes([
			menu({ id: 'button', menuType: 'F', path: '/button' }),
			menu({ id: 'hidden', visible: 0, path: '/hidden' }),
			menu({ id: 'disabled', status: 0, path: '/disabled' }),
		])

		expect(result).toEqual([])
	})
})

describe('firstAccessiblePath', () => {
	it('returns the first navigable page or null', () => {
		expect(firstAccessiblePath([menu({ path: '/first' }), menu({ path: '/second' })])).toBe('/first')
		expect(firstAccessiblePath([])).toBeNull()
	})
})
