import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { http } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { UserInfo } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
		defaultValues: { username: 'admin', password: '' },
	})

	const onSubmit = async (values: FormValues) => {
		try {
			// login 拿 token(此时 store 还没 token,me 请求手动带新 token)
			const { token } = await http.post<{ token: string }>('/auth/login', values)
			const me = await http.get<MeResp>('/auth/me', {
				headers: { Authorization: `Bearer ${token}` },
			})
			setAuth(
				token,
				{ userId: me.userId, username: me.username, nickname: me.nickname, avatar: me.avatar },
				me.authorities,
			)
			toast.success('登录成功')
			navigate('/')
		} catch {
			// 拦截器已 toast 错误
		}
	}

	return (
		<div className="flex min-h-svh items-center justify-center bg-background p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">Breeze 后台管理</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="username">用户名</Label>
							<Input id="username" autoComplete="username" {...register('username')} />
							{errors.username && (
								<p className="text-sm text-destructive">{errors.username.message}</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">密码</Label>
							<Input
								id="password"
								type="password"
								autoComplete="current-password"
								{...register('password')}
							/>
							{errors.password && (
								<p className="text-sm text-destructive">{errors.password.message}</p>
							)}
						</div>
						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? '登录中…' : '登录'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
