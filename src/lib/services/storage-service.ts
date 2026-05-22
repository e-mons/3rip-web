import { supabase } from '../supabase'

export const StorageService = {
  async uploadFile(bucket: string, path: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { error } = await supabase.storage.from(bucket).upload(filePath, file)

    if (error) {
      console.error('Error uploading file:', error)
      throw new Error(error.message)
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
    return data.publicUrl
  },

  async uploadAvatar(file: File): Promise<string> {
    return this.uploadFile('avatars', 'profiles', file)
  },

  async uploadVehicleImage(file: File): Promise<string> {
    return this.uploadFile('vehicles', 'images', file)
  },

  async uploadDocument(file: File): Promise<string> {
    return this.uploadFile('documents', 'verification', file)
  }
}
