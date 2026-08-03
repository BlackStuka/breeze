import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { http } from '@/lib/api'
import type { Menu } from '@/types'
import { PageHeader } from '@/components/PageHeader'
import { PermissionButton } from '@/components/PermissionButton'
import { DataTable } from '@/components/DataTable'
import { Badge } from '@/components/ui/badge'
import { MenuFormDialog } from './MenuFormDialog'

const typeLabel: Record<string, string> = { M: '目录', C: '菜单', F: '按钮' }

export default function MenuPage() {
	const queryClient = useQueryClient()
	const [dialogOpen, setDialogOpen] = useState(false)
	const [editing, setEditing] = useState<Menu | null>(null)

	const { data: menus } = useQuery({
		queryKey: ['menus', 'all'],
		queryFn: () => http.get<Menu[]>('/menus'),
	})

	const refresh = () => queryClient.invalidateQueries({ queryKey: ['menus'] })

	const deleteMutation = useMutation({
		mutationFn: (id: string) => http.delete(`/menus/${id}`),
		onSuccess: () => {
			toast.success('删除成功')
			refresh()
		},
	})

	const columns: ColumnDef<Menu>[] = [
		{ header: '名称', accessorKey: 'menuName' },
		{
			header: '类型',
			cell: ({ row }) => (
				<Badge variant="outline">{typeLabel[row.original.menuType] ?? row.original.menuType}</Badge>
			),
		},
		{ header: '权限标识', cell: ({ row }) => row.original.perms ?? '-' },
		{ header: '路径', cell: ({ row }) => row.original.path ?? '-' },
		{ header: '排序', accessorKey: 'sort' },
		{
			header: '操作',
			cell: ({ row }) => (
				<div className="flex gap-1">
					<PermissionButton
						size="sm"
						variant="outline"
						code="system:menu:edit"
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
						code="system:menu:remove"
						onClick={() => {
							if (confirm('确认删除该菜单?')) deleteMutation.mutate(row.original.id)
						}}
					>
						删除
					</PermissionButton>
				</div>
			),
		},
	]

	return (
		<div>
			<PageHeader
				title="菜单管理"
				actions={
					<PermissionButton
						code="system:menu:add"
						onClick={() => {
							setEditing(null)
							setDialogOpen(true)
						}}
					>
						<Plus className="mr-1 size-4" />
						新增菜单
					</PermissionButton>
				}
			/>
			<DataTable columns={columns} data={menus ?? []} />
			<MenuFormDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				editing={editing}
				menus={menus ?? []}
				onSaved={refresh}
			/>
		</div>
	)
}
