import type { QueryClient } from '@tanstack/react-query'

export const menuQueryKeys = {
	all: ['menus'] as const,
	tree: ['menus', 'tree'] as const,
	management: ['menus', 'all'] as const,
}

export function invalidateMenuTree(queryClient: QueryClient) {
	return queryClient.invalidateQueries({ queryKey: menuQueryKeys.tree })
}

export function invalidateMenuQueries(queryClient: QueryClient) {
	return queryClient.invalidateQueries({ queryKey: menuQueryKeys.all })
}

export function removeMenuQueries(queryClient: QueryClient) {
	return queryClient.removeQueries({ queryKey: menuQueryKeys.all })
}
