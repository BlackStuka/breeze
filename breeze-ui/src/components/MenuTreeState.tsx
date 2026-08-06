import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MenuTreeError({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="flex flex-col items-center gap-2 px-3 py-4 text-center text-sm text-muted-foreground">
			<p>菜单加载失败，请重试。</p>
			<Button variant="outline" size="sm" onClick={onRetry}>
				<RefreshCw data-icon="inline-start" />重试
			</Button>
		</div>
	)
}

export function MenuTreeEmpty() {
	return <div className="px-3 py-4 text-sm text-muted-foreground">当前账号暂无可访问菜单</div>
}

export function MenuTreeLoading() {
	return <div className="px-3 py-4 text-sm text-muted-foreground">菜单加载中…</div>
}
