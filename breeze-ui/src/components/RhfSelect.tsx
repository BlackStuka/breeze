import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

interface Option {
	label: string
	value: string
}

interface Props<T extends FieldValues> {
	control: Control<T>
	name: FieldPath<T>
	options: Option[]
	/**
	 * 将 Select 的 string 值转回表单字段类型。
	 * 数字字段(status/visible)传 Number,字符串字段(parentId/menuType)不传(默认原样)。
	 */
	parse?: (v: string) => unknown
	placeholder?: string
	className?: string
	/** 透传到 SelectTrigger,配合外层 <FieldLabel htmlFor> 实现点击 label 聚焦/展开。 */
	id?: string
	'aria-invalid'?: boolean
}

/**
 * RHF + shadcn Select 胶水。shadcn Select 是 Radix 受控组件,无法用 register,
 * 这里用 Controller 桥接:Select 的 value 统一转成 string,写回 RHF 时按 parse 还原类型。
 */
export function RhfSelect<T extends FieldValues>({
	control,
	name,
	options,
	parse,
	placeholder,
	className,
	id,
	'aria-invalid': ariaInvalid,
}: Props<T>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => (
				<Select
					value={field.value != null ? String(field.value) : undefined}
					onValueChange={(v) => field.onChange(parse ? parse(v) : v)}
				>
					<SelectTrigger id={id} className={className} aria-invalid={ariaInvalid}>
						<SelectValue placeholder={placeholder} />
					</SelectTrigger>
					<SelectContent>
						{options.map((o) => (
							<SelectItem key={o.value} value={o.value}>
								{o.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}
		/>
	)
}
