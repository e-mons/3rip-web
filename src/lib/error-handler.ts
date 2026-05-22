import { supabase } from '@/lib/supabase'

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const handleError = (error: any) => {
  if (error instanceof AppError) {
    return { message: error.message, code: error.code }
  }
  
  // Supabase specific errors
  if (error.code === 'PGRST116') {
    return { message: 'Resource not found', code: 'NOT_FOUND' }
  }

  // Network issues
  if (error.message === 'Failed to fetch') {
    return { message: 'Network connection lost. Please check your internet.', code: 'OFFLINE' }
  }

  return { message: 'An unexpected error occurred', code: 'INTERNAL_ERROR' }
}

/**
 * Network Retry Wrapper
 * Retries a function multiple times before failing.
 */
export async function withRetry<T>(
  fn: () => Promise<T>, 
  retries: number = 3, 
  delay: number = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) throw error
    await new Promise(resolve => setTimeout(resolve, delay))
    return withRetry(fn, retries - 1, delay * 2)
  }
}
