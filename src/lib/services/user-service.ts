import { supabase, supabaseAdmin } from '../supabase'
import { AdminService } from './admin-service'
import { User } from '../types'

export const UserService = {
  async getUsers(role?: string): Promise<User[]> {
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (role && role !== 'All') {
      query = query.eq('role', role.toLowerCase())
    }

    const { data, error } = await query
    if (error) throw error
    return data as User[]
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    await AdminService.logAction('UPDATE', 'users', userId, updates)
    return data as User
  },

  async toggleUserActive(userId: string, isActive: boolean) {
    return this.updateUser(userId, { is_active: isActive })
  },

  async deleteUser(userId: string) {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) throw error

    await AdminService.logAction('DELETE', 'users', userId, {})
  },

  async createUser(userData: any) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    await AdminService.logAction('CREATE', 'users', data.id, userData)
    return data
  }
}
