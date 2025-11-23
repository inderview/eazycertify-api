export type AdminRole = 'super_admin' | 'exam_admin' | 'content_contributor'

export interface AdminUser {
	email: string
	password: string
	role: AdminRole
}


