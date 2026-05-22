'use server'

import { supabaseAdmin } from '@/lib/supabase'

export async function logActionAction(action: string, targetTable: string, targetId: string | null, details: any, userId: string) {
  const { error } = await supabaseAdmin.from('admin_logs').insert({
    admin_id: userId,
    action,
    target_table: targetTable,
    target_id: targetId,
    details: typeof details === 'string' ? { message: details } : details
  })
  
  if (error) throw new Error(error.message)
}

export async function updateStatusAction(table: string, id: string, status: string, details: any, userId: string) {
  const { data, error } = await supabaseAdmin
    .from(table)
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  await logActionAction('UPDATE', table, id, { 
    new_status: status,
    ...details
  }, userId)

  return data
}

export async function deleteRecordAction(table: string, id: string, details: any, userId: string) {
  const { error } = await supabaseAdmin
    .from(table)
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  await logActionAction('DELETE', table, id, details, userId)
}

export async function getAuditLogsAction() {
  const { data, error } = await supabaseAdmin
    .from('admin_logs')
    .select(`
      *,
      admin:admin_id (
        first_name,
        last_name,
        email
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw new Error(error.message)
  return data
}
