import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
	return (
		<div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
			<h1 className="text-2xl font-semibold">页面不存在</h1>
			<p className="text-muted-foreground">请求的页面不存在或已被移除。</p>
			<Button asChild><Link to="/">返回首页</Link></Button>
		</div>
	)
}
