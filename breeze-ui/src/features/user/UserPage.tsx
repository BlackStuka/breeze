import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { http } from '@/lib/api'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import type { PageResult, UserResp } from '@/types'
import { PageHeader } from '@/components/PageHeader'
import { PermissionButton } from '@/components/PermissionButton'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardFooter } from '@/components/ui/card'
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
import { UserFormDialog } from './UserFormDialog'

export default function UserPage() {
	const [page, setPage] = useState(1)
	const [size, setSize] = useState(10)
	const [search, setSearch] = useState('')
	const debouncedSearch = useDebouncedValue(search, 300)
	const [dialogOpen, setDialogOpen] = useState(false)
	const [editing, setEditing] = useState<UserResp | null>(null)
	const [pendingDelete, setPendingDelete] = useState<UserResp | null>(null)
	const queryClient = useQueryClient()

	const { data, isLoading } = useQuery({
		queryKey: ['users', page, size, debouncedSearch],
		queryFn: () =>
			http.get<PageResult<UserResp>>('/users', {
				params: { pageNum: page, pageSize: size, username: debouncedSearch || undefined },
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
		{
			header: '状态',
			cell: ({ row }) =>
				row.original.status === 1 ? (
					<Badge variant="secondary">启用</Badge>
				) : (
					<Badge variant="destructive">禁用</Badge>
				),
		},
		{ header: '创建时间', accessorKey: 'createTime' },
		{
			header: '操作',
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
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
						onClick={() => setPendingDelete(row.original)}
					>
						删除
					</PermissionButton>
				</div>
			),
		},
	]

	const total = Number(data?.total ?? 0)

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
						<Plus className="size-4" />
						新增用户
					</PermissionButton>
				}
			/>
			<Card className="gap-0 p-0">
				<div className="flex items-center gap-2 border-b px-4 py-3">
					<Input
						placeholder="按用户名搜索"
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
			<UserFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} onSaved={refresh} />
			<AlertDialog open={!!pendingDelete} onOpenChange={(v) => !v && setPendingDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>确认删除</AlertDialogTitle>
						<AlertDialogDescription>
							确认删除用户「{pendingDelete?.username}」?此操作不可撤销。
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
