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
		control,
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
					<DialogDescription>{isEdit ? '修改角色信息。' : '创建一个新的系统角色。'}</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="role-roleName">角色名</Label>
						<Input
							id="role-roleName"
							disabled={isEdit}
							aria-invalid={!!errors.roleName}
							{...register('roleName')}
						/>
						<FormError message={errors.roleName?.message} />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="role-roleCode">编码</Label>
						<Input
							id="role-roleCode"
							disabled={isEdit}
							aria-invalid={!!errors.roleCode}
							{...register('roleCode')}
						/>
						<FormError message={errors.roleCode?.message} />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="role-sort">排序</Label>
						<Input id="role-sort" type="number" {...register('sort', { valueAsNumber: true })} />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="role-status">状态</Label>
						<RhfSelect
							id="role-status"
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
