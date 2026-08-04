import type { ReactNode } from 'react'

interface Props {
	/** 有值才渲染;无错误返回 null,便于直接传 errors.x?.message。 */
	message?: ReactNode
}

/** 表单字段错误文案。统一样式 + role="alert"(屏幕阅读器即时朗读)。 */
export function FormError({ message }: Props) {
	if (!message) return null
	return <p role="alert" className="text-sm font-medium text-destructive">{message}</p>
}
