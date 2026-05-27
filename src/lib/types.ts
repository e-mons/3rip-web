export interface User {
  id: string
  first_name: string
  last_name: string
  full_name?: string
  email: string
  phone_number?: string
  role: 'rider' | 'driver' | 'admin' | 'support'
  is_active: boolean
  verification_status: 'unverified' | 'verified' | 'rejected' | 'suspended'
  created_at: string
  image_url?: string
}

export interface Driver {
  id: string
  user_id: string
  user?: User
  license_number: string
  current_location?: { lat: number; lng: number }
  heading?: number
  is_online: boolean
  rating: number
  total_trips: number
  status: 'pending_verification' | 'verified' | 'suspended' | 'active' | 'inactive'
  created_at: string
}

export interface Vehicle {
  id: string
  driver_id?: string
  driver?: {
    id: string
    user?: Partial<User>
  }
  make: string
  model: string
  year: number
  color: string
  plate_number: string
  type: string
  capacity: number
  status: 'active' | 'maintenance' | 'retired'
  approval_status: 'pending' | 'approved' | 'rejected'
  created_at: string
  image_url?: string
}

export interface Booking {
  id: string
  rider_id: string
  driver_id?: string
  rider?: Partial<User>
  driver?: {
    id: string
    users: Partial<User>
    current_location?: { lat: number; lng: number }
    heading?: number
  }
  vehicle?: Partial<Vehicle>
  type: 'ride' | 'parcel' | 'freight' | 'rental'
  status: 'searching' | 'accepted' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'scheduled'
  pickup_address: string
  dropoff_address: string
  estimated_fare: number
  actual_fare?: number
  notes?: string
  scheduled_for?: string
  created_at: string
}

export interface Payout {
  id: string
  wallet_id: string
  wallet?: {
    balance: number
    user: Partial<User>
  }
  amount: number
  type: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
}

export interface CommissionRule {
  id: string
  name: string
  type: 'percentage' | 'fixed'
  value: number
  target: 'all' | 'premium' | 'economy'
  is_active: boolean
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  type: string
  target_audience: 'all' | 'riders' | 'drivers'
  status: 'draft' | 'sent'
  created_at: string
}

export interface AuditLog {
  id: string
  admin_id: string
  admin?: Partial<User>
  action: string
  target_table: string
  target_id: string
  details: any
  created_at: string
}

export interface SupportTicket {
  id: string
  user_id: string
  user?: Partial<User>
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
}

export interface SupportMessage {
  id: string
  ticket_id: string
  sender_id: string
  content: string
  is_admin_reply: boolean
  created_at: string
}
