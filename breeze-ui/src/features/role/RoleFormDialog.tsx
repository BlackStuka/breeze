import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { http } from '@/lib/api'
import type { RoleResp } from '@/types'
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

const schema = z.object({
	roleName: z.string().min(1, '请输入角色名'),
	roleCode: z.string().min(1, '请输入编码'),
	sort: z.number(),
	status: z.number(),
})
type FormValues = z.infer<typeof schema>

interface Props {
	open: boolean
	onOpenChange: (v: boolean) => void
	editing: RoleResp | null
	onSaved: () => void
}

export function RoleFormDialog({ open, onOpenChange, editing, onSaved }: Props) {
	const isEdit = !!editing
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { roleName: '', roleCode: '', sort: 0, status: 1 },
	})

	useEffect(() => {
		if (!open) return
		reset(
			editing
				? { roleName: editing.roleName, roleCode: editing.roleCode, sort: editing.sort, status: editing.status }
				: { roleName: '', roleCode: '', sort: 0, status: 1 },
		)
	}, [open, editing, reset])

	const onSubmit = async (values: FormValues) => {
		if (isEdit) {
			await http.put(`/roles/${editing!.id}`, values)
		} else {
			await http.post('/roles', values)
		}
		toast.success('保存成功')
		onSaved()
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{isEdit ? '编辑角色' : '新增角色'}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
					<div className="space-y-1">
						<Label>角色名</Label>
						<Input disabled={isEdit} {...register('roleName')} />
						{errors.roleName && <p className="text-xs text-destructive">{errors.roleName.message}</p>}
					</div>
					<div className="space-y-1">
						<Label>编码</Label>
						<Input disabled={isEdit} {...register('roleCode')} />
					</div>
					<div className="space-y-1">
						<Label>排序</Label>
						<Input type="number" {...register('sort', { valueAsNumber: true })} />
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
