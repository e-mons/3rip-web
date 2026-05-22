'use client'

import React, { useEffect, useState } from 'react'
import { 
  Users, 
  Car, 
  Navigation, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Calendar,
  Sparkles,
  MoreHorizontal,
  Settings,
  CreditCard
} from 'lucide-react'
import { Card, Badge } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AdminService } from '@/lib/services/admin-service'
import { DriverService } from '@/lib/services/driver-service'
import { supabase } from '@/lib/supabase'
import MapboxMap from '@/components/shared/MapboxMap'
import { useLiveTrips } from '@/hooks/use-realtime'

export default function DashboardPage() {
  const [aiInsight, setAiInsight] = useState('Analyzing platform metrics...')
  const [isAiLoading, setIsAiLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [adminName, setAdminName] = useState('Administrator')
  const [stats, setStats] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [topDrivers, setTopDrivers] = useState<any[]>([])

  const { trips } = useLiveTrips()

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [dashboardStats, recentActivity, drivers, { data: { user } }] = await Promise.all([
          AdminService.getStats(),
          AdminService.getRecentActivity(),
          DriverService.getDrivers(),
          supabase.auth.getUser()
        ])

        if (user) {
          const { data: profile } = await supabase.from('users').select('first_name, last_name').eq('id', user.id).single()
          if (profile) setAdminName(`${profile.first_name} ${profile.last_name}`)
        }

        setStats([
          { label: 'Total Revenue', value: `$${dashboardStats.revenue.toLocaleString()}`, change: dashboardStats.revenueGrowth, icon: DollarSign, color: 'text-emerald-500', trend: dashboardStats.revenueGrowth.startsWith('+') ? 'up' : 'down' },
          { label: 'Active Riders', value: dashboardStats.riders.toLocaleString(), change: dashboardStats.ridersGrowth, icon: Users, color: 'text-primary', trend: dashboardStats.ridersGrowth.startsWith('+') ? 'up' : 'down' },
          { label: 'Verified Drivers', value: dashboardStats.drivers.toLocaleString(), change: dashboardStats.driversGrowth, icon: Car, color: 'text-blue-500', trend: dashboardStats.driversGrowth.startsWith('+') ? 'up' : 'down' },
          { label: 'Avg. Ride Time', value: dashboardStats.avgRideTime, change: dashboardStats.bookingsGrowth, icon: Navigation, color: 'text-amber-500', trend: dashboardStats.bookingsGrowth.startsWith('+') ? 'up' : 'down' },
        ])

        setActivity(recentActivity)
        setTopDrivers(drivers.slice(0, 3))

        // Get AI Insight
        try {
          const { GeminiService } = await import('@/lib/services/gemini-service')
          const insight = await GeminiService.getDashboardInsights(dashboardStats)
          setAiInsight(insight)
        } catch (aiError) {
          console.error('AI Insight Error:', aiError)
          setAiInsight('Intelligence module temporarily unavailable. Monitoring platform health manually.')
        }
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setIsLoading(false)
        setIsAiLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2 italic">
            Command Center
          </h1>
          <p className="text-gray-500 font-medium">
            Good morning, <span className="text-gray-900 font-bold">{adminName}</span>. Here's what's happening on the platform today.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gray-100/50 p-1.5 rounded-2xl border border-black/5">
           <Button variant="ghost" size="sm" className="text-gray-500">Last 24h</Button>
           <Link href="/ai-insights">
             <Button size="sm">Real-time Metrics</Button>
           </Link>
        </div>
      </div>

      {/* AI Briefing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-8 bg-primary/5 border-primary/10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-24 h-24 text-primary" />
           </div>
           <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
              <div className="w-16 h-16 rounded-[24px] bg-primary flex items-center justify-center shrink-0 shadow-2xl shadow-primary/20">
                 <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 space-y-4">
                 <div className="flex items-center gap-3">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Strategic Intelligence Briefing</h3>
                    <Badge variant="success" className="bg-primary/10 border-primary/20 text-primary text-[8px] animate-pulse">Live Analysis</Badge>
                 </div>
                 {isAiLoading ? (
                    <div className="space-y-3">
                       <div className="h-4 bg-primary/10 rounded-full w-full animate-pulse" />
                       <div className="h-4 bg-primary/10 rounded-full w-3/4 animate-pulse" />
                    </div>
                 ) : (
                    <div className="space-y-4">
                       <p className="text-lg font-black text-gray-900 leading-tight tracking-tight italic max-w-4xl">
                          {aiInsight.split('\n')[0]}
                       </p>
                       {aiInsight.split('\n').length > 1 && (
                         <div className="flex flex-wrap gap-4 pt-2 border-t border-primary/10">
                            {aiInsight.split('\n').slice(1).map((line, idx) => (
                               <p key={idx} className="text-xs font-bold text-gray-500 italic flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                  {line.trim()}
                               </p>
                            ))}
                         </div>
                       )}
                    </div>
                 )}
              </div>
              <div className="shrink-0 flex flex-col items-end gap-3">
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Platform Health</p>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm font-bold text-gray-900">OPTIMIZED</span>
                   </div>
                </div>
                <Link href="/ai-insights">
                   <Button variant="secondary" size="sm" className="bg-white hover:bg-white/80 border-black/5 text-[10px] font-black uppercase tracking-widest px-6 h-10 rounded-xl">
                      View full report
                   </Button>
                </Link>
              </div>
           </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={stat.label.includes('Revenue') ? '/payments' : stat.label.includes('Riders') ? '/users' : stat.label.includes('Drivers') ? '/drivers' : '/overview'}>
              <Card className="p-6 group hover:border-black/10 transition-all cursor-pointer overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-black/[0.01] rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-black/[0.03] transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center", stat.color)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-[10px] font-black italic px-2 py-1 rounded-lg",
                    stat.trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black italic text-gray-900">{stat.value}</h3>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Live Map Insight */}
        <Card className="xl:col-span-2 p-8 h-[500px] flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                 <h3 className="text-xl font-bold flex items-center gap-3 italic text-gray-900">
                    <Activity className="w-5 h-5 text-primary" />
                    Network Activity
                 </h3>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Real-time trip distribution across Dubai</p>
              </div>
              <Link href="/tracking">
                <Button variant="secondary" size="sm">Go to Tracking</Button>
              </Link>
           </div>
           
           <div className="flex-1 rounded-[32px] bg-gray-50 border border-black/5 relative overflow-hidden flex items-center justify-center">
              <MapboxMap 
                center={{ lat: 25.2048, lng: 55.2708 }}
                trips={trips}
                onTripSelect={() => {}}
              />
           </div>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="p-8 flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold italic text-gray-900">Critical Alerts</h3>
              <Badge variant="danger">Live updates</Badge>
           </div>
           <div className="flex-1 space-y-6">
              {activity.length > 0 ? activity.map((alert, i) => (
                <div key={i} className="flex gap-4">
                   <div className={cn(
                     "mt-1 w-2 h-2 rounded-full shrink-0 animate-pulse",
                     alert.type === 'danger' ? 'bg-red-500' : alert.type === 'warning' ? 'bg-amber-500' : alert.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                   )} />
                   <div>
                      <p className="text-sm font-bold text-gray-900 mb-0.5">{alert.title}</p>
                      <p className="text-[10px] text-gray-400 font-medium leading-tight mb-1">{alert.body}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(alert.created_at).toLocaleTimeString()}</p>
                   </div>
                </div>
              )) : (
                <p className="text-xs text-gray-400 italic">No recent alerts</p>
              )}
           </div>
           <Link href="/notifications">
              <Button variant="secondary" className="w-full mt-8 h-12 font-black italic tracking-widest text-[10px] uppercase">
                View All Notifications
              </Button>
           </Link>
        </Card>
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
         <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold italic text-gray-900">Top Performing Drivers</h3>
               <Calendar className="w-5 h-5 text-gray-300" />
            </div>
            <div className="space-y-4">
               {topDrivers.map((driver, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-black/5 group hover:border-black/10 transition-all cursor-pointer">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold italic uppercase">
                          {driver.user?.first_name?.[0] || 'D'}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{driver.user?.first_name} {driver.user?.last_name}</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{driver.rating} Rating • {driver.total_rides} Rides</p>
                        </div>
                     </div>
                     <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  </div>
               ))}
            </div>
         </Card>

         <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold italic text-gray-900">Platform Control</h3>
               <MoreHorizontal className="w-5 h-5 text-gray-300" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <Link href="/system" className="contents">
                  <Button variant="secondary" className="h-24 flex flex-col items-center justify-center gap-3 rounded-3xl group w-full">
                     <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                        <Settings className="w-5 h-5 group-hover:text-primary" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest">System</span>
                  </Button>
               </Link>
               <Link href="/commission" className="contents">
                  <Button variant="secondary" className="h-24 flex flex-col items-center justify-center gap-3 rounded-3xl group w-full">
                     <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                        <CreditCard className="w-5 h-5 group-hover:text-primary" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest">Pricing</span>
                  </Button>
               </Link>
            </div>
         </Card>
      </div>
    </div>
  )
}

