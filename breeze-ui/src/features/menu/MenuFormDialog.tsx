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
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RhfSelect } from '@/components/RhfSelect'
import { FormError } from '@/components/FormError'

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
		control,
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
					<DialogDescription>{isEdit ? '修改菜单项配置。' : '新增一个菜单、目录或按钮权限项。'}</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="menu-parentId">父菜单</Label>
						<RhfSelect
							id="menu-parentId"
							control={control}
							name="parentId"
							className="w-full"
							options={[
								{ label: '根菜单', value: '0' },
								...menus.map((m) => ({ label: m.menuName, value: m.id })),
							]}
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="grid gap-2">
							<Label htmlFor="menu-menuName">名称</Label>
							<Input id="menu-menuName" aria-invalid={!!errors.menuName} {...register('menuName')} />
							<FormError message={errors.menuName?.message} />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="menu-menuType">类型</Label>
							<RhfSelect
								id="menu-menuType"
								control={control}
								name="menuType"
								className="w-full"
								options={[
									{ label: '目录', value: 'M' },
									{ label: '菜单', value: 'C' },
									{ label: '按钮', value: 'F' },
								]}
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="grid gap-2">
							<Label htmlFor="menu-path">路径</Label>
							<Input id="menu-path" {...register('path')} placeholder="/system 或 user" />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="menu-component">组件</Label>
							<Input id="menu-component" {...register('component')} placeholder="system/user/index" />
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="grid gap-2">
							<Label htmlFor="menu-perms">权限标识</Label>
							<Input id="menu-perms" {...register('perms')} placeholder="system:user:list" />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="menu-icon">图标</Label>
							<Input id="menu-icon" {...register('icon')} placeholder="lucide 名" />
						</div>
					</div>
					<div className="grid grid-cols-3 gap-3">
						<div className="grid gap-2">
							<Label htmlFor="menu-sort">排序</Label>
							<Input id="menu-sort" type="number" {...register('sort', { valueAsNumber: true })} />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="menu-visible">可见</Label>
							<RhfSelect
								id="menu-visible"
								control={control}
								name="visible"
								className="w-full"
								options={[
									{ label: '显示', value: '1' },
									{ label: '隐藏', value: '0' },
								]}
								parse={Number}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="menu-status">状态</Label>
							<RhfSelect
								id="menu-status"
								control={control}
								name="status"
								className="w-full"
								options={[
									{ label: '启用', value: '1' },
									{ label: '禁用', value: '0' },
								]}
								parse={Number}
							/>
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
