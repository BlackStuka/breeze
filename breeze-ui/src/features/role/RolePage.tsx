import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { http } from '@/lib/api'
import type { PageResult, RoleResp } from '@/types'
import { PageHeader } from '@/components/PageHeader'
import { PermissionButton } from '@/components/PermissionButton'
import { DataTable } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RoleFormDialog } from './RoleFormDialog'
import { MenuAssignDialog } from './MenuAssignDialog'

export default function RolePage() {
	const [page, setPage] = useState(1)
	const [size] = useState(10)
	const [search, setSearch] = useState('')
	const [formOpen, setFormOpen] = useState(false)
	const [editing, setEditing] = useState<RoleResp | null>(null)
	const [assignRole, setAssignRole] = useState<RoleResp | null>(null)
	const queryClient = useQueryClient()

	const { data } = useQuery({
		queryKey: ['roles', page, size, search],
		queryFn: () =>
			http.get<PageResult<RoleResp>>('/roles', {
				params: { pageNum: page, pageSize: size, roleName: search || undefined },
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
		{ header: '状态', cell: ({ row }) => (row.original.status === 1 ? '启用' : '禁用') },
		{
			header: '操作',
			cell: ({ row }) => (
				<div className="flex gap-1">
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
					<PermissionButton
						size="sm"
						variant="outline"
						code="system:role:remove"
						onClick={() => {
							if (confirm('确认删除该角色?')) deleteMutation.mutate(row.original.id)
						}}
					>
						删除
					</PermissionButton>
				</div>
			),
		},
	]

	const total = Number(data?.total ?? 0)
	const totalPages = Math.ceil(total / size) || 1

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
						<Plus className="mr-1 size-4" />
						新增角色
					</PermissionButton>
				}
			/>
			<div className="mb-3">
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
			<DataTable columns={columns} data={data?.records ?? []} />
			<div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
				<span>共 {total} 条</span>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
						上一页
					</Button>
					<span className="px-1">
						{page} / {totalPages}
					</span>
					<Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
						下一页
					</Button>
				</div>
			</div>
			<RoleFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} onSaved={refresh} />
			<MenuAssignDialog role={assignRole} onOpenChange={(v) => !v && setAssignRole(null)} />
		</div>
	)
}
