import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Ellipsis, Plus, Trash2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { http } from '@/lib/api'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import type { PageResult, RoleResp } from '@/types'
import { PageHeader } from '@/components/PageHeader'
import { PermissionButton } from '@/components/PermissionButton'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/auth'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RoleFormDialog } from './RoleFormDialog'
import { MenuAssignDialog } from './MenuAssignDialog'

export default function RolePage() {
	const [page, setPage] = useState(1)
	const [size, setSize] = useState(10)
	const [search, setSearch] = useState('')
	const debouncedSearch = useDebouncedValue(search, 300)
	const [formOpen, setFormOpen] = useState(false)
	const [editing, setEditing] = useState<RoleResp | null>(null)
	const [assignRole, setAssignRole] = useState<RoleResp | null>(null)
	const [pendingDelete, setPendingDelete] = useState<RoleResp | null>(null)
	const queryClient = useQueryClient()
	const canRemove = useAuthStore((s) => s.hasAuthority('system:role:remove'))

	const { data, isLoading } = useQuery({
		queryKey: ['roles', page, size, debouncedSearch],
		queryFn: () =>
			http.get<PageResult<RoleResp>>('/roles', {
				params: { pageNum: page, pageSize: size, roleName: debouncedSearch || undefined },
			}),
	})

	const refresh = () => queryClient.invalidateQueries({ queryKey: ['roles'] })

	const deleteMutation = useMutation({
		mutationFn: (id: string) => http.delete(`/roles/${id}`),
		onSuccess: () => {
			toast.success('删除成功')
			refresh()
		},
	})

	const columns: ColumnDef<RoleResp>[] = [
		{ header: '角色名', accessorKey: 'roleName' },
		{ header: '编码', accessorKey: 'roleCode' },
		{ header: '排序', accessorKey: 'sort' },
		{
			header: '状态',
			cell: ({ row }) =>
				row.original.status === 1 ? (
					<Badge variant="secondary">启用</Badge>
				) : (
					<Badge variant="destructive">禁用</Badge>
				),
		},
		{
			header: '操作',
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<PermissionButton
						size="sm"
						variant="outline"
						code="system:role:edit"
						onClick={() => {
							setEditing(row.original)
							setFormOpen(true)
						}}
					>
						编辑
					</PermissionButton>
					<PermissionButton
						size="sm"
						variant="outline"
						code="system:role:edit"
						onClick={() => setAssignRole(row.original)}
					>
						分配菜单
					</PermissionButton>
					{canRemove && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon-sm" aria-label="更多操作">
									<Ellipsis />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-36">
								<DropdownMenuItem
									variant="destructive"
									onClick={() => setPendingDelete(row.original)}
								>
									<Trash2 />
									删除
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			),
		},
	]

	const total = Number(data?.total ?? 0)

	return (
		<div>
			<PageHeader
				title="角色管理"
				actions={
					<PermissionButton
						code="system:role:add"
						onClick={() => {
							setEditing(null)
							setFormOpen(true)
						}}
					>
						<Plus data-icon="inline-start" />
						新增角色
					</PermissionButton>
				}
			/>
			<Card className="gap-0 p-0">
				<div className="flex items-center gap-2 border-b px-4 py-3">
					<Input
						placeholder="按角色名搜索"
						value={search}
						onChange={(e) => {
							setSearch(e.target.value)
							setPage(1)
						}}
						className="max-w-xs"
					/>
				</div>
				<DataTable columns={columns} data={data?.records ?? []} loading={isLoading} bordered={false} />
				<CardFooter>
					<Pagination
						page={page}
						pageSize={size}
						total={total}
						onPageChange={setPage}
						onPageSizeChange={(s) => {
							setSize(s)
							setPage(1)
						}}
					/>
				</CardFooter>
			</Card>
			<RoleFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} onSaved={refresh} />
			<MenuAssignDialog role={assignRole} onOpenChange={(v) => !v && setAssignRole(null)} />
			<AlertDialog open={!!pendingDelete} onOpenChange={(v) => !v && setPendingDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>确认删除</AlertDialogTitle>
						<AlertDialogDescription>
							确认删除角色「{pendingDelete?.roleName}」?此操作不可撤销。
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>取消</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={() => {
								if (pendingDelete) deleteMutation.mutate(pendingDelete.id)
								setPendingDelete(null)
							}}
						>
							删除
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
