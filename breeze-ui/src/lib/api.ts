import axios, { type AxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth'

const api = axios.create({
	baseURL: '/api',
	timeout: 15000,
})

// 请求拦截器:注入 JWT
api.interceptors.request.use((config) => {
	const token = useAuthStore.getState().token
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

// 响应拦截器:成功解出 Result.data;失败 toast;401 清登录态并跳登录
api.interceptors.response.use(
	(response) => {
		const result = response.data
		if (result?.code === 0) {
			return result.data
		}
		toast.error(result?.message ?? '请求失败')
		return Promise.reject(new Error(result?.message ?? '请求失败'))
	},
	(error) => {
		const status = error.response?.status
		const message = error.response?.data?.message ?? error.message ?? '请求失败'
		if (status === 401) {
			useAuthStore.getState().clear()
			if (!window.location.pathname.startsWith('/login')) {
				window.location.href = '/login'
			}
		} else {
			toast.error(message)
		}
		return Promise.reject(error)
	},
)

// 类型友好封装:拦截器已解出 Result.data,这里让泛型直接对应业务数据
export const http = {
	get: <T>(url: string, config?: AxiosRequestConfig) => api.get(url, config) as unknown as Promise<T>,
	post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
		api.post(url, data, config) as unknown as Promise<T>,
	put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
		api.put(url, data, config) as unknown as Promise<T>,
	delete: <T>(url: string, config?: AxiosRequestConfig) => api.delete(url, config) as unknown as Promise<T>,
}

export default api
