import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { http } from '@/lib/api'
import type { RoleResp } from '@/types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { RhfSelect } from '@/components/RhfSelect'

const schema = z.object({
	roleName: z.string().min(1, '请输入角色名').max(64, '角色名不能超过64个字符'),
	roleCode: z.string().regex(/^[A-Za-z][A-Za-z0-9:_-]*$/, '编码必须以字母开头，只能包含字母、数字和 :_-'),
	sort: z.number().int('排序必须是整数').min(0, '排序不能为负数'),
	status: z.number().int().min(0).max(1),
})
type FormValues = z.infer<typeof schema>
interface Props { open: boolean; onOpenChange: (v: boolean) => void; editing: RoleResp | null; onSaved: () => void }

export function RoleFormDialog({ open, onOpenChange, editing, onSaved }: Props) {
	const isEdit = !!editing
	const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { roleName: '', roleCode: '', sort: 0, status: 1 } })
	useEffect(() => { if (open) reset(editing ? { roleName: editing.roleName, roleCode: editing.roleCode, sort: editing.sort, status: editing.status } : { roleName: '', roleCode: '', sort: 0, status: 1 }) }, [open, editing, reset])
	const onSubmit = async (values: FormValues) => { if (isEdit) await http.put(`/roles/${editing!.id}`, values); else await http.post('/roles', values); toast.success('保存成功'); onSaved(); onOpenChange(false) }
	return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>{isEdit ? '编辑角色' : '新增角色'}</DialogTitle><DialogDescription>{isEdit ? '修改角色信息。' : '创建一个新的系统角色。'}</DialogDescription></DialogHeader><form onSubmit={handleSubmit(onSubmit)}><FieldGroup>
		<Field data-invalid={!!errors.roleName} data-disabled={isEdit}><FieldLabel htmlFor="role-roleName">角色名</FieldLabel><Input id="role-roleName" disabled={isEdit} aria-invalid={!!errors.roleName} {...register('roleName')} /><FieldError errors={[errors.roleName]} /></Field>
		<Field data-invalid={!!errors.roleCode} data-disabled={isEdit}><FieldLabel htmlFor="role-roleCode">编码</FieldLabel><Input id="role-roleCode" disabled={isEdit} aria-invalid={!!errors.roleCode} {...register('roleCode')} /><FieldError errors={[errors.roleCode]} /></Field>
		<Field><FieldLabel htmlFor="role-sort">排序</FieldLabel><Input id="role-sort" type="number" {...register('sort', { valueAsNumber: true })} /></Field>
		<Field><FieldLabel htmlFor="role-status">状态</FieldLabel><RhfSelect id="role-status" control={control} name="status" className="w-full" options={[{ label: '启用', value: '1' }, { label: '禁用', value: '0' }]} parse={Number} /></Field>
	</FieldGroup><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? '保存中…' : '保存'}</Button></DialogFooter></form></DialogContent></Dialog>
}
