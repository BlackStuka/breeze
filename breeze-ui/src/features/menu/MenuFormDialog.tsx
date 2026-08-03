import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { http } from '@/lib/api'
import type { Menu } from '@/types'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// parentId 是雪花大数(>2^53),必须保持 string(否则 Number 丢精度);后端 Long 接 numeric string
const schema = z.object({
	parentId: z.string(),
	menuName: z.string().min(1, '请输入名称'),
	menuType: z.string().min(1),
	path: z.string().optional(),
	component: z.string().optional(),
	perms: z.string().optional(),
	icon: z.string().optional(),
	sort: z.number(),
	visible: z.number(),
	status: z.number(),
})
type FormValues = z.infer<typeof schema>

interface Props {
	open: boolean
	onOpenChange: (v: boolean) => void
	editing: Menu | null
	menus: Menu[]
	onSaved: () => void
}

const empty: FormValues = {
	parentId: '0',
	menuName: '',
	menuType: 'C',
	path: '',
	component: '',
	perms: '',
	icon: '',
	sort: 0,
	visible: 1,
	status: 1,
}

export function MenuFormDialog({ open, onOpenChange, editing, menus, onSaved }: Props) {
	const isEdit = !!editing
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: empty,
	})

	useEffect(() => {
		if (!open) return
		reset(
			editing
				? {
						parentId: editing.parentId ?? '0',
						menuName: editing.menuName,
						menuType: editing.menuType,
						path: editing.path ?? '',
						component: editing.component ?? '',
						perms: editing.perms ?? '',
						icon: editing.icon ?? '',
						sort: editing.sort,
						visible: editing.visible,
						status: editing.status,
					}
				: empty,
		)
	}, [open, editing, reset])

	const onSubmit = async (values: FormValues) => {
		if (isEdit) {
			await http.put(`/menus/${editing!.id}`, values)
		} else {
			await http.post('/menus', values)
		}
		toast.success('保存成功')
		onSaved()
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] max-w-lg overflow-auto">
				<DialogHeader>
					<DialogTitle>{isEdit ? '编辑菜单' : '新增菜单'}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
					<div className="space-y-1">
						<Label>父菜单</Label>
						<select className="w-full rounded-md border px-2 py-2 text-sm" {...register('parentId')}>
							<option value="0">根菜单</option>
							{menus.map((m) => (
								<option key={m.id} value={m.id}>
									{m.menuName}
								</option>
							))}
						</select>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<Label>名称</Label>
							<Input {...register('menuName')} />
							{errors.menuName && (
								<p className="text-xs text-destructive">{errors.menuName.message}</p>
							)}
						</div>
						<div className="space-y-1">
							<Label>类型</Label>
							<select className="w-full rounded-md border px-2 py-2 text-sm" {...register('menuType')}>
								<option value="M">目录</option>
								<option value="C">菜单</option>
								<option value="F">按钮</option>
							</select>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<Label>路径</Label>
							<Input {...register('path')} placeholder="/system 或 user" />
						</div>
						<div className="space-y-1">
							<Label>组件</Label>
							<Input {...register('component')} placeholder="system/user/index" />
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<Label>权限标识</Label>
							<Input {...register('perms')} placeholder="system:user:list" />
						</div>
						<div className="space-y-1">
							<Label>图标</Label>
							<Input {...register('icon')} placeholder="lucide 名" />
						</div>
					</div>
					<div className="grid grid-cols-3 gap-3">
						<div className="space-y-1">
							<Label>排序</Label>
							<Input type="number" {...register('sort', { valueAsNumber: true })} />
						</div>
						<div className="space-y-1">
							<Label>可见</Label>
							<select
								className="w-full rounded-md border px-2 py-2 text-sm"
								{...register('visible', { valueAsNumber: true })}
							>
								<option value={1}>显示</option>
								<option value={0}>隐藏</option>
							</select>
						</div>
						<div className="space-y-1">
							<Label>状态</Label>
							<select
								className="w-full rounded-md border px-2 py-2 text-sm"
								{...register('status', { valueAsNumber: true })}
							>
								<option value={1}>启用</option>
								<option value={0}>禁用</option>
							</select>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							取消
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? '保存中…' : '保存'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
