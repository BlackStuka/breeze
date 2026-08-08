import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { http } from '@/lib/api'
import type { RoleResp, UserResp, UserSaveRequest } from '@/types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { RhfSelect } from '@/components/RhfSelect'

const schema = z.object({
	username: z.string().min(1, '请输入用户名'),
	password: z.string().max(72, '密码不能超过72位'),
	nickname: z.string().optional(),
	email: z.string().optional(),
	phone: z.string().optional(),
	status: z.number().int().min(0).max(1),
	roleIds: z.array(z.string()),
})
type FormValues = z.infer<typeof schema>

interface Props {
	open: boolean
	onOpenChange: (v: boolean) => void
	editing: UserResp | null
	onSaved: (userId: string) => void
}

export function UserFormDialog({ open, onOpenChange, editing, onSaved }: Props) {
	const isEdit = !!editing
	const { data: roles, isLoading: isRolesLoading } = useQuery({
		queryKey: ['roles', 'options'],
		queryFn: () => http.get<RoleResp[]>('/roles/options'),
		enabled: open,
	})
	const { register, handleSubmit, reset, setError, setValue, watch, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { username: '', password: '', nickname: '', email: '', phone: '', status: 1, roleIds: [] },
	})
	const roleIds = watch('roleIds')

	useEffect(() => {
		if (!open) return
		reset(editing
			? { username: editing.username, password: '', nickname: editing.nickname ?? '', email: editing.email ?? '', phone: editing.phone ?? '', status: editing.status, roleIds: editing.roleIds ?? [] }
			: { username: '', password: '', nickname: '', email: '', phone: '', status: 1, roleIds: [] })
	}, [open, editing, reset])

	const toggleRole = (roleId: string) => {
		setValue('roleIds', roleIds.includes(roleId)
			? roleIds.filter((id) => id !== roleId)
			: [...roleIds, roleId], { shouldDirty: true })
	}

	const onSubmit = async (values: FormValues) => {
		const payload: UserSaveRequest = {
			nickname: values.nickname,
			email: values.email,
			phone: values.phone,
			status: values.status,
			roleIds: values.roleIds,
		}
		if (!isEdit && values.password.length < 8) {
			setError('password', { type: 'validate', message: '密码至少需要 8 位' })
			return
		}
		const savedId = isEdit ? editing!.id : await http.post<string>('/users', { ...payload, username: values.username, password: values.password })
		if (isEdit) await http.put(`/users/${editing!.id}`, payload)
		toast.success('保存成功')
		onSaved(savedId)
		onOpenChange(false)
	}

	return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[80vh] max-w-md overflow-auto"><DialogHeader><DialogTitle>{isEdit ? '编辑用户' : '新增用户'}</DialogTitle><DialogDescription>{isEdit ? '修改用户基本信息和角色。' : '创建一个新的系统用户账号并分配角色。'}</DialogDescription></DialogHeader><form onSubmit={handleSubmit(onSubmit)}><FieldGroup>
		<Field data-invalid={!!errors.username} data-disabled={isEdit}><FieldLabel htmlFor="user-username">用户名</FieldLabel><Input id="user-username" disabled={isEdit} aria-invalid={!!errors.username} {...register('username')} /><FieldError errors={[errors.username]} /></Field>
		<Field data-invalid={!!errors.password} data-disabled={isEdit}><FieldLabel htmlFor="user-password">密码{isEdit && '(改密走重置)'}</FieldLabel><Input id="user-password" type="password" disabled={isEdit} aria-invalid={!!errors.password} {...register('password')} /><FieldError errors={[errors.password]} /></Field>
		<Field><FieldLabel htmlFor="user-nickname">昵称</FieldLabel><Input id="user-nickname" {...register('nickname')} /></Field>
		<Field><FieldLabel htmlFor="user-email">邮箱</FieldLabel><Input id="user-email" {...register('email')} /></Field>
		<Field><FieldLabel htmlFor="user-phone">手机</FieldLabel><Input id="user-phone" {...register('phone')} /></Field>
		<Field><FieldLabel htmlFor="user-status">状态</FieldLabel><RhfSelect id="user-status" control={control} name="status" className="w-full" options={[{ label: '启用', value: '1' }, { label: '禁用', value: '0' }]} parse={Number} /></Field>
		<FieldSet><FieldLegend>角色</FieldLegend><FieldGroup className="gap-2 py-2">{isRolesLoading ? <p className="text-sm text-muted-foreground">加载角色中…</p> : roles?.map((role) => <Field key={role.id} orientation="horizontal"><Checkbox id={`user-role-${role.id}`} checked={roleIds.includes(role.id)} onCheckedChange={() => toggleRole(role.id)} /><FieldContent><FieldLabel htmlFor={`user-role-${role.id}`}>{role.roleName}<span className="ml-2 text-xs text-muted-foreground">{role.roleCode}</span></FieldLabel></FieldContent></Field>)}</FieldGroup></FieldSet>
	</FieldGroup><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button><Button type="submit" disabled={isSubmitting || isRolesLoading}>{isSubmitting ? '保存中…' : '保存'}</Button></DialogFooter></form></DialogContent></Dialog>
}
