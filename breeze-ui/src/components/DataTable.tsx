import { useEffect, useRef, useState } from 'react'
import {
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	useReactTable,
	type ExpandedState,
	type RowData,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

/** 骨架行各列轮换宽度,避免整齐划一的机械感。 */
const SKELETON_WIDTHS = ['w-full', 'w-4/5', 'w-3/5', 'w-2/3', 'w-1/2', 'w-3/4']

interface Props<TData, TValue = unknown> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	/** 加载中:渲染骨架行,不渲染空态。 */
	loading?: boolean
	/** 自带 ring/圆角外壳;放进 Card 时传 false 避免双重描边。 */
	bordered?: boolean
	/** 传入则启用树形展开(行需有 id 字段);不传为普通扁平表。 */
	getSubRows?: (row: TData) => TData[] | undefined
}

/** TanStack Table 封装(只渲染,分页/搜索在页面层驱动后端分页)。 */
export function DataTable<TData extends RowData, TValue = unknown>({
	columns,
	data,
	loading,
	bordered = true,
	getSubRows,
}: Props<TData, TValue>) {
	const [expanded, setExpanded] = useState<ExpandedState>({})
	const inited = useRef(false)

	const table = useReactTable({
		data,
		columns,
		getSubRows,
		getCoreRowModel: getCoreRowModel(),
		...(getSubRows && {
			state: { expanded },
			onExpandedChange: setExpanded,
			// 默认 row.id 是行索引;树形展开状态按 row.id 存,这里改成数据 id 以便展开状态稳定。
			getRowId: (row: TData) => (row as { id: string }).id,
			getExpandedRowModel: getExpandedRowModel(),
		}),
	})

	// 树形模式:首次拿到数据时全部展开一次,之后保留用户的手动折叠状态。
	useEffect(() => {
		if (!getSubRows || inited.current || !data.length) return
		const all: ExpandedState = {}
		const walk = (rows: TData[]) => {
			for (const r of rows) {
				const sub = getSubRows(r)
				if (sub?.length) {
					all[(r as { id: string }).id] = true
					walk(sub)
				}
			}
		}
		walk(data)
		setExpanded(all)
		inited.current = true
	}, [getSubRows, data])

	return (
		<div className={cn('overflow-hidden', bordered && 'rounded-xl ring-1 ring-foreground/10')}>
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((hg) => (
						<TableRow key={hg.id}>
							{hg.headers.map((h) => (
								<TableHead key={h.id}>
									{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{loading ? (
						Array.from({ length: 5 }).map((_, i) => (
							<TableRow key={i}>
								{columns.map((_, j) => (
									<TableCell key={j}>
										<Skeleton
											className={cn('h-5', SKELETON_WIDTHS[(i + j) % SKELETON_WIDTHS.length])}
										/>
									</TableCell>
								))}
							</TableRow>
						))
					) : table.getRowModel().rows.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
								<div className="flex flex-col items-center gap-2">
									<Inbox className="size-6" />
									<span>暂无数据</span>
								</div>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	)
}
