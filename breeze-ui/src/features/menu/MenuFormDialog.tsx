import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { http } from '@/lib/api'
import type { Menu } from '@/types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { RhfSelect } from '@/components/RhfSelect'
const schema = z.object({ parentId:z.string(), menuName:z.string().min(1,'请输入名称'), menuType:z.string().min(1), path:z.string().optional(), component:z.string().optional(), perms:z.string().optional(), icon:z.string().optional(), sort:z.number(), visible:z.number(), status:z.number() })
type FormValues=z.infer<typeof schema>
interface Props { open:boolean; onOpenChange:(v:boolean)=>void; editing:Menu|null; menus:Menu[]; onSaved:()=>void }
const empty:FormValues={parentId:'0',menuName:'',menuType:'C',path:'',component:'',perms:'',icon:'',sort:0,visible:1,status:1}
export function MenuFormDialog({open,onOpenChange,editing,menus,onSaved}:Props){const isEdit=!!editing;const {register,handleSubmit,reset,control,formState:{errors,isSubmitting}}=useForm<FormValues>({resolver:zodResolver(schema),defaultValues:empty});useEffect(()=>{if(open)reset(editing?{parentId:editing.parentId??'0',menuName:editing.menuName,menuType:editing.menuType,path:editing.path??'',component:editing.component??'',perms:editing.perms??'',icon:editing.icon??'',sort:editing.sort,visible:editing.visible,status:editing.status}:empty)},[open,editing,reset]);const onSubmit=async(v:FormValues)=>{if(isEdit)await http.put(`/menus/${editing!.id}`,v);else await http.post('/menus',v);toast.success('保存成功');onSaved();onOpenChange(false)};const select=(id:string,name:keyof FormValues,options:{label:string;value:string}[],parse?:(v:string)=>unknown)=><RhfSelect id={id} control={control} name={name} className="w-full" options={options} parse={parse}/>;return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[85vh] max-w-lg overflow-auto"><DialogHeader><DialogTitle>{isEdit?'编辑菜单':'新增菜单'}</DialogTitle><DialogDescription>{isEdit?'修改菜单项配置。':'新增一个菜单、目录或按钮权限项。'}</DialogDescription></DialogHeader><form onSubmit={handleSubmit(onSubmit)}><FieldGroup>
<Field><FieldLabel htmlFor="menu-parentId">父菜单</FieldLabel>{select('menu-parentId','parentId',[{label:'根菜单',value:'0'},...menus.map(m=>({label:m.menuName,value:m.id}))])}</Field>
<div className="grid grid-cols-2 gap-3"><Field data-invalid={!!errors.menuName}><FieldLabel htmlFor="menu-menuName">名称</FieldLabel><Input id="menu-menuName" aria-invalid={!!errors.menuName} {...register('menuName')}/><FieldError errors={[errors.menuName]}/></Field><Field><FieldLabel htmlFor="menu-menuType">类型</FieldLabel>{select('menu-menuType','menuType',[{label:'目录',value:'M'},{label:'菜单',value:'C'},{label:'按钮',value:'F'}])}</Field></div>
<div className="grid grid-cols-2 gap-3"><Field><FieldLabel htmlFor="menu-path">路径</FieldLabel><Input id="menu-path" {...register('path')} placeholder="/system 或 user"/></Field><Field><FieldLabel htmlFor="menu-component">组件</FieldLabel><Input id="menu-component" {...register('component')} placeholder="system/user/index"/></Field></div>
<div className="grid grid-cols-2 gap-3"><Field><FieldLabel htmlFor="menu-perms">权限标识</FieldLabel><Input id="menu-perms" {...register('perms')} placeholder="system:user:list"/></Field><Field><FieldLabel htmlFor="menu-icon">图标</FieldLabel><Input id="menu-icon" {...register('icon')} placeholder="lucide 名"/></Field></div>
<div className="grid grid-cols-3 gap-3"><Field><FieldLabel htmlFor="menu-sort">排序</FieldLabel><Input id="menu-sort" type="number" {...register('sort',{valueAsNumber:true})}/></Field><Field><FieldLabel htmlFor="menu-visible">可见</FieldLabel>{select('menu-visible','visible',[{label:'显示',value:'1'},{label:'隐藏',value:'0'}],Number)}</Field><Field><FieldLabel htmlFor="menu-status">状态</FieldLabel>{select('menu-status','status',[{label:'启用',value:'1'},{label:'禁用',value:'0'}],Number)}</Field></div>
</FieldGroup><DialogFooter><Button type="button" variant="outline" onClick={()=>onOpenChange(false)}>取消</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting?'保存中…':'保存'}</Button></DialogFooter></form></DialogContent></Dialog>}
