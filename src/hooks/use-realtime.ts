'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// 1. Live Ride Tracking Hook
export function useLiveRideTracking() {
  const [drivers, setDrivers] = useState<any[]>([])

  useEffect(() => {
    // Initial fetch
    const fetchDrivers = async () => {
      const { data } = await supabase
        .from('drivers')
        .select('*')
        .eq('is_online', true)
      if (data) setDrivers(data)
    }

    fetchDrivers()

    // Realtime subscription
    const subscription = supabase
      .channel('live-drivers')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'drivers' 
      }, (payload) => {
        setDrivers(prev => prev.map(d => d.id === payload.new.id ? payload.new : d))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  return { drivers }
}

// 1.1 Live Trip Monitoring Hook
export function useLiveTrips() {
  const [trips, setTrips] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTrips = async () => {
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          rider:rider_id (
            first_name,
            last_name
          ),
          driver:driver_id (
            current_location,
            heading,
            users (
              first_name,
              last_name
            )
          )
        `)
        .in('status', ['accepted', 'arrived', 'in_progress'])
      if (data) setTrips(data)
      setIsLoading(false)
    }

    fetchTrips()

    const subscription = supabase
      .channel('live-trips')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookings' 
      }, () => {
        fetchTrips() // Refetch to get relational data
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  return { trips, isLoading }
}

// 2. Chat System Hook
export function useChatRealtime(bookingId?: string) {
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    if (!bookingId) return

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true })
      if (data) setMessages(data)
    }

    fetchMessages()

    const subscription = supabase
      .channel(`chat-${bookingId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `booking_id=eq.${bookingId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [bookingId])

  return { messages }
}

// 2.1 Support Ticket Hook
export function useSupportConversation(ticketId?: string) {
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    if (!ticketId) return

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('ticket_replies')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })
      if (data) setMessages(data)
    }

    fetchMessages()

    const subscription = supabase
      .channel(`ticket-${ticketId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'ticket_replies',
        filter: `ticket_id=eq.${ticketId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [ticketId])

  return { messages }
}

// 3. Booking Updates Hook
export function useBookingUpdates() {
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    const fetchBookings = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (data) setBookings(data)
    }

    fetchBookings()

    const subscription = supabase
      .channel('booking-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookings' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setBookings(prev => [payload.new, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setBookings(prev => prev.map(b => b.id === payload.new.id ? payload.new : b))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  return { bookings }
}

// 4. Notifications Hook
export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) setNotifications(data)
    }

    fetchNotifications()

    const subscription = supabase
      .channel('system-notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  return { notifications }
}
