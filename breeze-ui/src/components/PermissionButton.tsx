import type { ComponentProps } from 'react'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'

interface Props extends ComponentProps<typeof Button> {
	/** 权限码,如 system:user:add;无此权限则不渲染 */
	code: string
}

/** 按钮级权限:无指定权限码时返回 null。 */
export function PermissionButton({ code, children, ...props }: Props) {
	const has = useAuthStore((s) => s.hasAuthority(code))
	if (!has) return null
	return <Button {...props}>{children}</Button>
}
