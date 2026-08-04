import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChevronRight, Plus } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { http } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Menu } from '@/types'
import { PageHeader } from '@/components/PageHeader'
import { PermissionButton } from '@/components/PermissionButton'
import { DataTable } from '@/components/DataTable'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
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
import { MenuFormDialog } from './MenuFormDialog'

const typeLabel: Record<string, string> = { M: '目录', C: '菜单', F: '按钮' }

/** 扁平菜单 → 树。根为 parentId 为空或 '0' 的节点;各级按 sort 升序。 */
function buildMenuTree(menus: Menu[]): Menu[] {
	const nodes = new Map(menus.map((m) => [m.id, { ...m, children: [] as Menu[] }]))
	const roots: Menu[] = []
	for (const node of nodes.values()) {
		const pid = node.parentId
		if (pid && pid !== '0' && nodes.has(pid)) {
			nodes.get(pid)!.children.push(node)
		} else {
			roots.push(node)
		}
	}
	const sortRecursive = (list: Menu[]) => {
		list.sort((a, b) => a.sort - b.sort)
		list.forEach((n) => n.children?.length && sortRecursive(n.children))
	}
	sortRecursive(roots)
	return roots
}

export default function MenuPage() {
	const queryClient = useQueryClient()
	const [dialogOpen, setDialogOpen] = useState(false)
	const [editing, setEditing] = useState<Menu | null>(null)
	const [pendingDelete, setPendingDelete] = useState<Menu | null>(null)

	const { data: menus, isLoading } = useQuery({
		queryKey: ['menus', 'all'],
		queryFn: () => http.get<Menu[]>('/menus'),
	})
	const tree = useMemo(() => buildMenuTree(menus ?? []), [menus])

	const refresh = () => queryClient.invalidateQueries({ queryKey: ['menus'] })

	const deleteMutation = useMutation({
		mutationFn: (id: string) => http.delete(`/menus/${id}`),
		onSuccess: () => {
			toast.success('删除成功')
			refresh()
		},
	})

	const columns: ColumnDef<Menu>[] = [
		{
			header: '名称',
			accessorKey: 'menuName',
			cell: ({ row }) => (
				<div
					className="flex items-center gap-1.5"
					style={{ paddingLeft: `${row.depth * 1.25}rem` }}
				>
					{row.getCanExpand() ? (
						<button
							type="button"
							onClick={row.getToggleExpandedHandler()}
							aria-label={row.getIsExpanded() ? '折叠' : '展开'}
							className="inline-flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted"
						>
							<ChevronRight
								className={cn('size-4 transition-transform', row.getIsExpanded() && 'rotate-90')}
							/>
						</button>
					) : (
						<span className="size-5 shrink-0" />
					)}
					<span>{row.original.menuName}</span>
				</div>
			),
		},
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
				<div className="flex items-center gap-2">
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
						onClick={() => setPendingDelete(row.original)}
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
						<Plus className="size-4" />
						新增菜单
					</PermissionButton>
				}
			/>
			<Card className="gap-0 p-0">
				<DataTable
					columns={columns}
					data={tree}
					loading={isLoading}
					bordered={false}
					getSubRows={(m) => m.children}
				/>
			</Card>
			<MenuFormDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				editing={editing}
				menus={menus ?? []}
				onSaved={refresh}
			/>
			<AlertDialog open={!!pendingDelete} onOpenChange={(v) => !v && setPendingDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>确认删除</AlertDialogTitle>
						<AlertDialogDescription>
							确认删除菜单「{pendingDelete?.menuName}」?此操作不可撤销。
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
