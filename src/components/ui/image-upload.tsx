'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Image as ImageIcon, X, UploadCloud, Loader2 } from 'lucide-react'
import { StorageService } from '@/lib/services/storage-service'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  bucket: 'vehicles' | 'avatars' | 'documents'
  path?: string
  className?: string
  label?: string
}

export function ImageUpload({
  value,
  onChange,
  bucket,
  path = 'general',
  className,
  label
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      setIsUploading(true)
      const url = await StorageService.uploadFile(bucket, path, file)
      onChange(url)
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }, [bucket, onChange, path])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false
  })

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {label}
        </label>
      )}
      
      <div 
        {...getRootProps()} 
        className={cn(
          "relative h-40 rounded-[32px] border-2 border-dashed transition-all cursor-pointer overflow-hidden flex items-center justify-center bg-gray-50",
          isDragActive ? "border-primary bg-primary/5" : "border-black/5 hover:border-black/10",
          value && "border-solid border-black/5"
        )}
      >
        <input {...getInputProps()} />
        
        {value ? (
          <div className="relative w-full h-full group">
            <img 
              src={value} 
              alt="Uploaded" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white text-xs font-bold">Change Image</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-900 hover:bg-white transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center px-6">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-400">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    {isDragActive ? "Drop it here" : "Upload Vehicle Photo"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Drag and drop or click to browse
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
