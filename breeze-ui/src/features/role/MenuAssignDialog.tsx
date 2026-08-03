import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { http } from '@/lib/api'
import type { Menu, RoleResp } from '@/types'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface Props {
	role: RoleResp | null
	onOpenChange: (v: boolean) => void
}

/** 角色分配菜单(全量覆盖)。v1 不预选已有;第 11 步加 GET /roles/{id}/menus 后预选。 */
export function MenuAssignDialog({ role, onOpenChange }: Props) {
	const open = !!role
	const [selected, setSelected] = useState<Set<string>>(new Set())

	const { data: menus } = useQuery({
		queryKey: ['menus', 'all'],
		queryFn: () => http.get<Menu[]>('/menus'),
		enabled: open,
	})

	useEffect(() => {
		if (open) setSelected(new Set())
	}, [open])

	const assignMutation = useMutation({
		mutationFn: () => http.put(`/roles/${role!.id}/menus`, { menuIds: [...selected] }),
		onSuccess: () => {
			toast.success('分配成功')
			onOpenChange(false)
		},
	})

	const toggle = (id: string) => {
		setSelected((s) => {
			const next = new Set(s)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[80vh] max-w-lg overflow-auto">
				<DialogHeader>
					<DialogTitle>分配菜单 · {role?.roleName}</DialogTitle>
				</DialogHeader>
				<p className="text-sm text-muted-foreground">
					全量覆盖:保存后角色将拥有下方勾选的菜单,未勾选的会被移除。
				</p>
				<div className="space-y-2 py-2">
					{menus?.map((m) => (
						<label key={m.id} className="flex items-center gap-2 text-sm">
							<Checkbox checked={selected.has(m.id)} onCheckedChange={() => toggle(m.id)} />
							<span>
								{m.menuName}
								<span className="ml-2 text-xs text-muted-foreground">
									[{m.menuType}] {m.perms ?? ''}
								</span>
							</span>
						</label>
					))}
				</div>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
						取消
					</Button>
					<Button onClick={() => assignMutation.mutate()} disabled={assignMutation.isPending}>
						{assignMutation.isPending ? '保存中…' : '保存'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
