import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ellipsis, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'
import type { PageResult, ProductResp } from '@/types'
import { http } from '@/lib/api'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { PageHeader } from '@/components/PageHeader'
import { PermissionButton } from '@/components/PermissionButton'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { ProductFormDialog } from './ProductFormDialog'
import { useAuthStore } from '@/store/auth'

export default function ProductPage() {
	const [page, setPage] = useState(1)
	const [size, setSize] = useState(10)
	const [search, setSearch] = useState('')
	const debouncedSearch = useDebouncedValue(search, 300)
	const [formOpen, setFormOpen] = useState(false)
	const [editing, setEditing] = useState<ProductResp | null>(null)
	const [pendingDelete, setPendingDelete] = useState<ProductResp | null>(null)
	const queryClient = useQueryClient()
	const canRemove = useAuthStore((state) => state.hasAuthority('business:product:remove'))

	const { data, isLoading } = useQuery({
		queryKey: ['products', page, size, debouncedSearch],
		queryFn: () => http.get<PageResult<ProductResp>>('/products', { params: { pageNum: page, pageSize: size, name: debouncedSearch || undefined } }),
	})
	const refresh = () => queryClient.invalidateQueries({ queryKey: ['products'] })
	const deleteMutation = useMutation({
		mutationFn: (id: string) => http.delete(`/products/${id}`),
		onSuccess: () => { toast.success('删除成功'); refresh() },
	})

	const columns: ColumnDef<ProductResp>[] = [
		{ header: '名称', accessorKey: 'name' },
		{ header: '编码', accessorKey: 'code' },
		{ header: '价格', cell: ({ row }) => `¥${Number(row.original.price).toFixed(2)}` },
		{ header: '状态', cell: ({ row }) => row.original.status === 1 ? <Badge variant="secondary">启用</Badge> : <Badge variant="destructive">停用</Badge> },
		{ header: '备注', cell: ({ row }) => row.original.remark ?? '-' },
		{ header: '操作', cell: ({ row }) => <div className="flex items-center gap-2"><PermissionButton size="sm" variant="outline" code="business:product:edit" onClick={() => { setEditing(row.original); setFormOpen(true) }}>编辑</PermissionButton>{canRemove && <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="更多操作"><Ellipsis /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-36"><DropdownMenuItem variant="destructive" onClick={() => setPendingDelete(row.original)}><Trash2 />删除</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}</div> },
	]

	return <div><PageHeader title="产品管理" description="业务模块扩展示例" actions={<PermissionButton code="business:product:add" onClick={() => { setEditing(null); setFormOpen(true) }}><Plus data-icon="inline-start" />新增产品</PermissionButton>} /><Card className="gap-0 p-0"><div className="flex items-center gap-2 border-b px-4 py-3"><Input placeholder="按产品名称搜索" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="max-w-xs" /></div><DataTable columns={columns} data={data?.records ?? []} loading={isLoading} bordered={false} /><CardFooter><Pagination page={page} pageSize={size} total={Number(data?.total ?? 0)} onPageChange={setPage} onPageSizeChange={(value) => { setSize(value); setPage(1) }} /></CardFooter></Card><ProductFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} onSaved={refresh} /><AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>确认删除</AlertDialogTitle><AlertDialogDescription>确认删除产品「{pendingDelete?.name}」?此操作不可撤销。</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => { if (pendingDelete) deleteMutation.mutate(pendingDelete.id); setPendingDelete(null) }}>删除</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>
}
