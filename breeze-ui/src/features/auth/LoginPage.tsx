import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Wind } from 'lucide-react'
import { http } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { UserInfo } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'

const schema = z.object({
	username: z.string().min(1, '请输入用户名'),
	password: z.string().min(1, '请输入密码'),
})
type FormValues = z.infer<typeof schema>

interface MeResp extends UserInfo {
	authorities: string[]
}

export default function LoginPage() {
	const navigate = useNavigate()
	const setAuth = useAuthStore((s) => s.setAuth)
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { username: '', password: '' },
	})

	const onSubmit = async (values: FormValues) => {
		try {
			const { token } = await http.post<{ token: string }>('/auth/login', values)
			const me = await http.get<MeResp>('/auth/me', {
				headers: { Authorization: `Bearer ${token}` },
			})
			setAuth(token, { userId: me.userId, username: me.username, nickname: me.nickname, avatar: me.avatar }, me.authorities)
			toast.success('登录成功')
			navigate('/')
		} catch {
			// 拦截器已 toast 错误
		}
	}

	return (
		<div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
			<div className="w-full max-w-sm">
				<div className="flex flex-col gap-6">
					<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
						<div className="flex flex-col items-center gap-2 text-center">
							<div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
								<Wind />
							</div>
							<h1 className="text-xl font-bold">欢迎回到 Breeze</h1>
							<p className="text-sm text-muted-foreground">
								还没有账号? <a href="#" className="underline underline-offset-4">注册</a>
							</p>
						</div>

						<FieldGroup>
							<Field data-invalid={!!errors.username}>
								<FieldLabel htmlFor="username">用户名</FieldLabel>
								<Input id="username" autoComplete="username" aria-invalid={!!errors.username} {...register('username')} />
								<FieldError errors={[errors.username]} />
							</Field>
							<Field data-invalid={!!errors.password}>
								<div className="flex items-center justify-between">
									<FieldLabel htmlFor="password">密码</FieldLabel>
									<a href="#" className="text-sm underline-offset-4 hover:underline">忘记密码?</a>
								</div>
								<Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register('password')} />
								<FieldError errors={[errors.password]} />
							</Field>
						</FieldGroup>

						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? '登录中…' : '登录'}
						</Button>

						<div className="flex items-center gap-3 text-sm text-muted-foreground">
							<Separator className="min-w-0 flex-1" />
							<span className="shrink-0">或</span>
							<Separator className="min-w-0 flex-1" />
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<Button variant="outline" type="button">
								<svg data-icon="inline-start" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="currentColor" /></svg>
								Apple
							</Button>
							<Button variant="outline" type="button">
								<svg data-icon="inline-start" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867.0.307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" /></svg>
								Google
							</Button>
						</div>
					</form>
					<p className="px-6 text-center text-sm text-muted-foreground">
						继续即表示同意我们的 <a href="#" className="underline underline-offset-4">服务条款</a> 与 <a href="#" className="underline underline-offset-4">隐私政策</a>。
					</p>
				</div>
			</div>
		</div>
	)
}
