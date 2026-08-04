import { useEffect, useState } from 'react'

/**
 * 防抖:value 变化后等 delay ms 才更新返回值。
 * 用于搜索框:输入用即时 state(受控),查询用防抖后的值,自动触发而不必按回车。
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
	const [debounced, setDebounced] = useState(value)
	useEffect(() => {
		const t = setTimeout(() => setDebounced(value), delay)
		return () => clearTimeout(t)
	}, [value, delay])
	return debounced
}
