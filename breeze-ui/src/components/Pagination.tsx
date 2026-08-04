import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

interface Props {
	page: number
	pageSize: number
	total: number
	onPageChange: (page: number) => void
	/** 传入则渲染「每页 N 条」选择器。 */
	onPageSizeChange?: (size: number) => void
	pageSizeOptions?: number[]
}

/** 分页(服务端驱动)。左侧总数,右侧每页条数 + 带省略号的页码导航。 */
export function Pagination({
	page,
	pageSize,
	total,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = [10, 20, 50],
}: Props) {
	const totalPages = Math.max(1, Math.ceil(total / pageSize))

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
			<span>共 {total} 条</span>
			<div className="flex items-center gap-4">
				{onPageSizeChange && (
					<div className="flex items-center gap-2">
						<span>每页</span>
						<Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
							<SelectTrigger size="sm" className="w-[72px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{pageSizeOptions.map((n) => (
									<SelectItem key={n} value={String(n)}>
										{n}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
				<div className="flex items-center gap-1">
					<Button
						variant="outline"
						size="icon-sm"
						aria-label="上一页"
						disabled={page <= 1}
						onClick={() => onPageChange(page - 1)}
					>
						<ChevronLeft />
					</Button>
					{getPageItems(page, totalPages).map((item, i) =>
						item === 'ellipsis' ? (
							<span key={`e-${i}`} className="flex h-7 min-w-7 items-center justify-center">
								…
							</span>
						) : (
							<Button
								key={item}
								variant={item === page ? 'default' : 'outline'}
								size="sm"
								className="min-w-7 px-2"
								aria-current={item === page ? 'page' : undefined}
								onClick={() => onPageChange(item)}
							>
								{item}
							</Button>
						),
					)}
					<Button
						variant="outline"
						size="icon-sm"
						aria-label="下一页"
						disabled={page >= totalPages}
						onClick={() => onPageChange(page + 1)}
					>
						<ChevronRight />
					</Button>
				</div>
			</div>
		</div>
	)
}

/** 计算要渲染的页码项(数字 + 省略号),首尾与当前页附近始终可见。 */
function getPageItems(current: number, totalPages: number): (number | 'ellipsis')[] {
	if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
	const items: (number | 'ellipsis')[] = [1]
	const left = Math.max(2, current - 1)
	const right = Math.min(totalPages - 1, current + 1)
	if (left > 2) items.push('ellipsis')
	for (let p = left; p <= right; p++) items.push(p)
	if (right < totalPages - 1) items.push('ellipsis')
	items.push(totalPages)
	return items
}
