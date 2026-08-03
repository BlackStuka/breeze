import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { http } from '@/lib/api'
import type { PageResult, UserResp } from '@/types'
import { PageHeader } from '@/components/PageHeader'
import { PermissionButton } from '@/components/PermissionButton'
import { DataTable } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserFormDialog } from './UserFormDialog'

export default function UserPage() {
	const [page, setPage] = useState(1)
	const [size] = useState(10)
	const [search, setSearch] = useState('')
	const [dialogOpen, setDialogOpen] = useState(false)
	const [editing, setEditing] = useState<UserResp | null>(null)
	const queryClient = useQueryClient()

	const { data } = useQuery({
		queryKey: ['users', page, size, search],
		queryFn: () =>
			http.get<PageResult<UserResp>>('/users', {
				params: { pageNum: page, pageSize: size, username: search || undefined },
			}),
	})

	const refresh = () => queryClient.invalidateQueries({ queryKey: ['users'] })

	const deleteMutation = useMutation({
		mutationFn: (id: string) => http.delete(`/users/${id}`),
		onSuccess: () => {
			toast.success('删除成功')
			refresh()
		},
	})

	const columns: ColumnDef<UserResp>[] = [
		{ header: '用户名', accessorKey: 'username' },
		{ header: '昵称', cell: ({ row }) => row.original.nickname ?? '-' },
		{ header: '邮箱', cell: ({ row }) => row.original.email ?? '-' },
		{ header: '状态', cell: ({ row }) => (row.original.status === 1 ? '启用' : '禁用') },
		{ header: '创建时间', accessorKey: 'createTime' },
		{
			header: '操作',
			cell: ({ row }) => (
				<div className="flex gap-1">
					<PermissionButton
						size="sm"
						variant="outline"
						code="system:user:edit"
						onClick={() => {
							setEditing(row.original)
							setDialogOpen(true)
						}}
					>
						编辑
					</PermissionButton>
					<PermissionButton
						size="sm"
						variant="outline"
						code="system:user:remove"
						onClick={() => {
							if (confirm('确认删除该用户?')) deleteMutation.mutate(row.original.id)
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
				title="用户管理"
				description="系统用户的增删改查"
				actions={
					<PermissionButton
						code="system:user:add"
						onClick={() => {
							setEditing(null)
							setDialogOpen(true)
						}}
					>
						<Plus className="mr-1 size-4" />
						新增用户
					</PermissionButton>
				}
			/>
			<div className="mb-3">
				<Input
					placeholder="按用户名搜索"
					value={search}
					onChange={(e) => {
						setSearch(e.target.value)
						setPage(1)
					}}
					className="max-w-xs"
					onKeyDown={(e) => {
						if (e.key === 'Enter') refresh()
					}}
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
			<UserFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} onSaved={refresh} />
		</div>
	)
}
