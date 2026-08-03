import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { http } from '@/lib/api'
import type { UserResp } from '@/types'
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

// zod 4:z.coerce.number() 的 input 类型是 unknown,与 RHF resolver 不兼容,
// 故 number 字段用 z.number() + RHF valueAsNumber
const schema = z.object({
	username: z.string().min(1, '请输入用户名'),
	password: z.string(), // 新增必填,编辑不用
	nickname: z.string().optional(),
	email: z.string().optional(),
	phone: z.string().optional(),
	status: z.number(),
})
type FormValues = z.infer<typeof schema>

interface Props {
	open: boolean
	onOpenChange: (v: boolean) => void
	editing: UserResp | null
	onSaved: () => void
}

export function UserFormDialog({ open, onOpenChange, editing, onSaved }: Props) {
	const isEdit = !!editing
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { username: '', password: '', nickname: '', email: '', phone: '', status: 1 },
	})

	useEffect(() => {
		if (!open) return
		reset(
			editing
				? {
						username: editing.username,
						password: '',
						nickname: editing.nickname ?? '',
						email: editing.email ?? '',
						phone: editing.phone ?? '',
						status: editing.status,
					}
				: { username: '', password: '', nickname: '', email: '', phone: '', status: 1 },
		)
	}, [open, editing, reset])

	const onSubmit = async (values: FormValues) => {
		const payload = {
			nickname: values.nickname,
			email: values.email,
			phone: values.phone,
			status: values.status,
		}
		if (isEdit) {
			await http.put(`/users/${editing!.id}`, payload)
		} else {
			if (!values.password) {
				toast.error('请输入密码')
				return
			}
			await http.post('/users', { username: values.username, password: values.password, ...payload })
		}
		toast.success('保存成功')
		onSaved()
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{isEdit ? '编辑用户' : '新增用户'}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
					<div className="space-y-1">
						<Label>用户名</Label>
						<Input disabled={isEdit} {...register('username')} />
						{errors.username && (
							<p className="text-xs text-destructive">{errors.username.message}</p>
						)}
					</div>
					<div className="space-y-1">
						<Label>密码{isEdit && '(改密走重置)'}</Label>
						<Input type="password" disabled={isEdit} {...register('password')} />
					</div>
					<div className="space-y-1">
						<Label>昵称</Label>
						<Input {...register('nickname')} />
					</div>
					<div className="space-y-1">
						<Label>邮箱</Label>
						<Input {...register('email')} />
					</div>
					<div className="space-y-1">
						<Label>手机</Label>
						<Input {...register('phone')} />
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
