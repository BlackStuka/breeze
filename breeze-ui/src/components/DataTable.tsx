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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

const SKELETON_WIDTHS = ['w-full', 'w-4/5', 'w-3/5', 'w-2/3', 'w-1/2', 'w-3/4']

interface Props<TData, TValue = unknown> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	loading?: boolean
	bordered?: boolean
	getSubRows?: (row: TData) => TData[] | undefined
}

export function DataTable<TData extends RowData, TValue = unknown>({ columns, data, loading, bordered = true, getSubRows }: Props<TData, TValue>) {
	const [expanded, setExpanded] = useState<ExpandedState>({})
	const inited = useRef(false)
	const table = useReactTable({
		data,
		columns,
		getSubRows,
		getCoreRowModel: getCoreRowModel(),
		...(getSubRows && { state: { expanded }, onExpandedChange: setExpanded, getRowId: (row: TData) => (row as { id: string }).id, getExpandedRowModel: getExpandedRowModel() }),
	})
	useEffect(() => {
		if (!getSubRows || inited.current || !data.length) return
		const all: ExpandedState = {}
		const walk = (rows: TData[]) => rows.forEach((row) => { const sub = getSubRows(row); if (sub?.length) { all[(row as { id: string }).id] = true; walk(sub) } })
		walk(data)
		setExpanded(all)
		inited.current = true
	}, [getSubRows, data])
	return <div className={cn('overflow-hidden', bordered && 'rounded-xl ring-1 ring-foreground/10')}><Table><TableHeader>{table.getHeaderGroups().map((headerGroup) => <TableRow key={headerGroup.id}>{headerGroup.headers.map((header) => <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}</TableRow>)}</TableHeader><TableBody>{loading ? Array.from({ length: 5 }).map((_, rowIndex) => <TableRow key={rowIndex}>{columns.map((_, columnIndex) => <TableCell key={columnIndex}><Skeleton className={cn('h-5', SKELETON_WIDTHS[(rowIndex + columnIndex) % SKELETON_WIDTHS.length])} /></TableCell>)}</TableRow>) : table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={columns.length} className="p-0"><Empty className="min-h-24 rounded-none border-0 p-4"><EmptyHeader><EmptyMedia variant="icon"><Inbox /></EmptyMedia><EmptyTitle>暂无数据</EmptyTitle></EmptyHeader></Empty></TableCell></TableRow>}</TableBody></Table></div>
}
