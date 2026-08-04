import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { http } from '@/lib/api'
import type { Menu, RoleMenuIdsResp, RoleResp } from '@/types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'

interface Props { role: RoleResp | null; onOpenChange: (v: boolean) => void }

export function MenuAssignDialog({ role, onOpenChange }: Props) {
	const open = !!role
	const [selected, setSelected] = useState<Set<string>>(new Set())
	const queryClient = useQueryClient()
	const { data: menus, isLoading: isMenusLoading } = useQuery({
		queryKey: ['menus', 'all'],
		queryFn: () => http.get<Menu[]>('/menus'),
		enabled: open,
	})
	const { data: assignment, isLoading: isAssignmentLoading } = useQuery({
		queryKey: ['roles', role?.id, 'menus'],
		queryFn: () => http.get<RoleMenuIdsResp>(`/roles/${role!.id}/menus`),
		enabled: open,
	})

	useEffect(() => {
		if (!open) {
			setSelected(new Set())
			return
		}
		if (assignment) setSelected(new Set(assignment.menuIds))
	}, [open, role?.id, assignment])

	const assignMutation = useMutation({
		mutationFn: () => http.put(`/roles/${role!.id}/menus`, { menuIds: [...selected] }),
		onSuccess: () => {
			toast.success('分配成功')
			queryClient.invalidateQueries({ queryKey: ['roles', role!.id, 'menus'] })
			queryClient.invalidateQueries({ queryKey: ['menus', 'tree'] })
			onOpenChange(false)
		},
	})
	const toggle = (id: string) => setSelected((current) => {
		const next = new Set(current)
		if (next.has(id)) next.delete(id)
		else next.add(id)
		return next
	})
	const isLoading = isMenusLoading || isAssignmentLoading

	return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[80vh] max-w-md overflow-auto"><DialogHeader><DialogTitle>分配菜单 · {role?.roleName}</DialogTitle><DialogDescription>保存后角色将拥有下方勾选的菜单，未勾选的授权会被移除。</DialogDescription></DialogHeader><FieldSet><FieldLegend>菜单权限</FieldLegend><FieldGroup className="gap-2 py-2">{isLoading ? <p className="text-sm text-muted-foreground">加载授权中…</p> : menus?.map((menu) => <Field key={menu.id} orientation="horizontal"><Checkbox id={`menu-${menu.id}`} checked={selected.has(menu.id)} onCheckedChange={() => toggle(menu.id)} /><FieldContent><FieldLabel htmlFor={`menu-${menu.id}`}>{menu.menuName}<span className="ml-2 text-xs text-muted-foreground">[{menu.menuType}] {menu.perms ?? ''}</span></FieldLabel></FieldContent></Field>)}</FieldGroup></FieldSet><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button><Button onClick={() => assignMutation.mutate()} disabled={assignMutation.isPending || isLoading}>{assignMutation.isPending ? '保存中…' : '保存'}</Button></DialogFooter></DialogContent></Dialog>
}
