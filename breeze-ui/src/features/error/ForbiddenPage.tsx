import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function ForbiddenPage() {
	return (
		<div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
			<h1 className="text-2xl font-semibold">没有权限</h1>
			<p className="text-muted-foreground">当前账号没有访问此页面的权限。</p>
			<Button asChild><Link to="/">返回首页</Link></Button>
		</div>
	)
}
