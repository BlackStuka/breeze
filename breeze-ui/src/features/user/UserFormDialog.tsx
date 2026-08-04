import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { http } from '@/lib/api'
import type { UserResp } from '@/types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { RhfSelect } from '@/components/RhfSelect'

const schema = z.object({ username: z.string().min(1, '请输入用户名'), password: z.string(), nickname: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), status: z.number() })
type FormValues = z.infer<typeof schema>
interface Props { open: boolean; onOpenChange: (v: boolean) => void; editing: UserResp | null; onSaved: () => void }

export function UserFormDialog({ open, onOpenChange, editing, onSaved }: Props) {
	const isEdit = !!editing
	const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { username: '', password: '', nickname: '', email: '', phone: '', status: 1 } })
	useEffect(() => { if (open) reset(editing ? { username: editing.username, password: '', nickname: editing.nickname ?? '', email: editing.email ?? '', phone: editing.phone ?? '', status: editing.status } : { username: '', password: '', nickname: '', email: '', phone: '', status: 1 }) }, [open, editing, reset])
	const onSubmit = async (values: FormValues) => { const payload = { nickname: values.nickname, email: values.email, phone: values.phone, status: values.status }; if (isEdit) await http.put(`/users/${editing!.id}`, payload); else { if (!values.password) { toast.error('请输入密码'); return }; await http.post('/users', { username: values.username, password: values.password, ...payload }) }; toast.success('保存成功'); onSaved(); onOpenChange(false) }
	return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>{isEdit ? '编辑用户' : '新增用户'}</DialogTitle><DialogDescription>{isEdit ? '修改用户基本信息。' : '创建一个新的系统用户账号。'}</DialogDescription></DialogHeader><form onSubmit={handleSubmit(onSubmit)}><FieldGroup>
		<Field data-invalid={!!errors.username} data-disabled={isEdit}><FieldLabel htmlFor="user-username">用户名</FieldLabel><Input id="user-username" disabled={isEdit} aria-invalid={!!errors.username} {...register('username')} /><FieldError errors={[errors.username]} /></Field>
		<Field data-disabled={isEdit}><FieldLabel htmlFor="user-password">密码{isEdit && '(改密走重置)'}</FieldLabel><Input id="user-password" type="password" disabled={isEdit} {...register('password')} /></Field>
		<Field><FieldLabel htmlFor="user-nickname">昵称</FieldLabel><Input id="user-nickname" {...register('nickname')} /></Field>
		<Field><FieldLabel htmlFor="user-email">邮箱</FieldLabel><Input id="user-email" {...register('email')} /></Field>
		<Field><FieldLabel htmlFor="user-phone">手机</FieldLabel><Input id="user-phone" {...register('phone')} /></Field>
		<Field><FieldLabel htmlFor="user-status">状态</FieldLabel><RhfSelect id="user-status" control={control} name="status" className="w-full" options={[{ label: '启用', value: '1' }, { label: '禁用', value: '0' }]} parse={Number} /></Field>
	</FieldGroup><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? '保存中…' : '保存'}</Button></DialogFooter></form></DialogContent></Dialog>
}
