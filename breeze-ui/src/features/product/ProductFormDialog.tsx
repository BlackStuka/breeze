import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { http } from '@/lib/api'
import type { ProductResp } from '@/types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { RhfSelect } from '@/components/RhfSelect'

const schema = z.object({
	name: z.string().min(1, '请输入产品名称').max(128, '名称不能超过128个字符'),
	code: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]*$/, '编码必须以字母开头，只能包含字母、数字、下划线和短横线'),
	price: z.number().finite('请输入有效价格').min(0, '价格不能为负数'),
	status: z.number().int().min(0).max(1),
	remark: z.string().max(500, '备注不能超过500个字符').optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
	open: boolean
	onOpenChange: (open: boolean) => void
	editing: ProductResp | null
	onSaved: () => void
}

export function ProductFormDialog({ open, onOpenChange, editing, onSaved }: Props) {
	const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { name: '', code: '', price: 0, status: 1, remark: '' },
	})

	useEffect(() => {
		if (!open) return
		reset(editing
			? { name: editing.name, code: editing.code, price: Number(editing.price), status: editing.status, remark: editing.remark ?? '' }
			: { name: '', code: '', price: 0, status: 1, remark: '' })
	}, [open, editing, reset])

	const onSubmit = async (values: FormValues) => {
		if (editing) await http.put(`/products/${editing.id}`, values)
		else await http.post('/products', values)
		toast.success('保存成功')
		onSaved()
		onOpenChange(false)
	}

	return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? '编辑产品' : '新增产品'}</DialogTitle><DialogDescription>{editing ? '修改产品信息。' : '创建一个用于演示业务模块扩展的产品。'}</DialogDescription></DialogHeader><form onSubmit={handleSubmit(onSubmit)}><FieldGroup>
		<Field data-invalid={!!errors.name}><FieldLabel htmlFor="product-name">名称</FieldLabel><Input id="product-name" aria-invalid={!!errors.name} {...register('name')} /><FieldError errors={[errors.name]} /></Field>
		<Field data-invalid={!!errors.code}><FieldLabel htmlFor="product-code">编码</FieldLabel><Input id="product-code" aria-invalid={!!errors.code} {...register('code')} /><FieldError errors={[errors.code]} /></Field>
		<div className="grid grid-cols-2 gap-3"><Field data-invalid={!!errors.price}><FieldLabel htmlFor="product-price">价格</FieldLabel><Input id="product-price" type="number" min="0" step="0.01" aria-invalid={!!errors.price} {...register('price', { valueAsNumber: true })} /><FieldError errors={[errors.price]} /></Field><Field><FieldLabel htmlFor="product-status">状态</FieldLabel><RhfSelect id="product-status" control={control} name="status" className="w-full" options={[{ label: '启用', value: '1' }, { label: '停用', value: '0' }]} parse={Number} /></Field></div>
		<Field data-invalid={!!errors.remark}><FieldLabel htmlFor="product-remark">备注</FieldLabel><Textarea id="product-remark" aria-invalid={!!errors.remark} {...register('remark')} /><FieldError errors={[errors.remark]} /></Field>
	</FieldGroup><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? '保存中…' : '保存'}</Button></DialogFooter></form></DialogContent></Dialog>
}
