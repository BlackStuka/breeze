export interface UserInfo {
	userId: string
	username: string
	nickname: string | null
	avatar: string | null
}

export interface UserResp {
	id: string
	username: string
	nickname: string | null
	avatar: string | null
	email: string | null
	phone: string | null
	status: number
	createTime: string
}

export interface RoleResp {
	id: string
	roleName: string
	roleCode: string
	sort: number
	status: number
	createTime: string
}

export interface Menu {
	id: string
	parentId: string | null
	menuName: string
	menuType: string // M目录 C菜单 F按钮
	path: string | null
	component: string | null
	perms: string | null
	icon: string | null
	sort: number
	visible: number
	status: number
	children?: Menu[]
}

export interface PageResult<T> {
	records: T[]
	// 后端 JsonConfig 全局 Long->String,所以 total 是 string;前端用 Number() 转换
	total: string
	current: number
	size: number
}

/** 统一响应体(后端 Result)。axios 拦截器已解出 data,一般无需直接用。 */
export interface Result<T> {
	code: number
	message: string
	data: T
}
