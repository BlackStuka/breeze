import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { http } from '@/lib/api'
import { filterNavigableMenus, flattenMenuRoutes, firstAccessiblePath } from '@/lib/menu'
import { menuQueryKeys } from '@/lib/menuQueries'
import type { Menu } from '@/types'

export function useMenuTree() {
	const query = useQuery({
		queryKey: menuQueryKeys.tree,
		queryFn: () => http.get<Menu[]>('/menus/tree'),
	})
	const rawMenus = query.data ?? []
	const menus = useMemo(() => filterNavigableMenus(rawMenus), [rawMenus])
	const routes = useMemo(() => flattenMenuRoutes(rawMenus), [rawMenus])
	const firstPath = useMemo(() => firstAccessiblePath(rawMenus), [rawMenus])
	const isEmpty = !query.isLoading && !query.isError && routes.length === 0

	return {
		...query,
		rawMenus,
		menus,
		routes,
		firstPath,
		isEmpty,
		isReady: !query.isLoading && !query.isError && routes.length > 0,
	}
}
