'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { logActionAction } from './admin'

export async function updateSettingAction(key: string, value: any, userId: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  let activeUserId = userId

  if (!userId || !uuidRegex.test(userId)) {
    try {
      const { data: adminUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .limit(1)
        .maybeSingle()
      
      activeUserId = adminUser?.id || '7ed9ec31-61c9-484d-b170-63d46fb8e90d'
    } catch {
      activeUserId = '7ed9ec31-61c9-484d-b170-63d46fb8e90d'
    }
  }

  const { data, error } = await supabaseAdmin
    .from('system_settings')
    .update({ 
      value, 
      updated_by: activeUserId,
      updated_at: new Date().toISOString() 
    })
    .eq('key', key)
    .select()
    .single()

  if (error) throw new Error(error.message)

  await logActionAction('UPDATE', 'system_settings', data.id, { key, value }, activeUserId)
  
  return data
}
