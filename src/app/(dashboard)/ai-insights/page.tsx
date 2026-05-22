'use client'

import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, Zap, MapPin, BarChart3, Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, Badge } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { GeminiService, AISuggestion } from '@/lib/services/gemini-service'
import { cn } from '@/lib/utils'
import MapboxMap from '@/components/shared/MapboxMap'
import { useLiveTrips } from '@/hooks/use-realtime'

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState<{
    pricing: AISuggestion | null,
    demand: AISuggestion | null,
    fleet: AISuggestion | null
  }>({
    pricing: null,
    demand: null,
    fleet: null
  })

  const { trips } = useLiveTrips()

  const fetchAIInsights = async () => {
    setLoading(true)
    try {
      const [pricing, demand, fleet] = await Promise.all([
        GeminiService.getSmartPricing(12.5, 'high'),
        GeminiService.getDemandPrediction('Downtown Dubai'),
        GeminiService.optimizeDriverFleet([])
      ])
      setInsights({ pricing, demand, fleet })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAIInsights()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">AI Insights</h1>
          </div>
          <p className="text-gray-500">Predictive analytics powered by Google Gemini.</p>
        </div>
        <Button 
          onClick={fetchAIInsights} 
          disabled={loading}
          className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Recalculate Models
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Pricing */}
        <InsightCard 
          title="Smart Pricing Suggestion"
          icon={TrendingUp}
          data={insights.pricing}
          loading={loading}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />

        {/* Demand Prediction */}
        <InsightCard 
          title="Demand Prediction"
          icon={Zap}
          data={insights.demand}
          loading={loading}
          color="text-amber-600"
          bg="bg-amber-50"
        />

        {/* Fleet Optimization */}
        <InsightCard 
          title="Fleet Optimization"
          icon={MapPin}
          data={insights.fleet}
          loading={loading}
          color="text-primary"
          bg="bg-primary/10"
        />
      </div>

      {/* Visual Analytics Simulation */}
      <Card className="p-0 relative overflow-hidden h-[400px]">
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-lg border border-black/5">
           <h2 className="font-bold text-gray-900 flex items-center gap-2"><Brain className="w-4 h-4 text-primary" /> Live AI Dispatch Visualizer</h2>
           <p className="text-xs text-gray-500 mt-1 max-w-[200px]">Real-time rendering of optimized fleet routes.</p>
           <div className="mt-3 flex gap-2">
              <Badge variant="info">Neural Routing Active</Badge>
           </div>
        </div>
        <MapboxMap 
          center={{ lat: 25.2048, lng: 55.2708 }}
          trips={trips}
          onTripSelect={() => {}}
        />
      </Card>
    </div>
  )
}

function InsightCard({ title, icon: Icon, data, loading, color, bg }: any) {
  return (
    <Card className="p-6 relative overflow-hidden group">
      <div className={cn("absolute top-0 right-0 p-4 opacity-10", color)}>
        <Icon className="w-12 h-12" />
      </div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg, color)}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-gray-700">{title}</h3>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded-full w-1/2 animate-pulse" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-lg font-medium leading-relaxed text-gray-900">
              {data?.suggestion || 'N/A'}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-black/5">
              <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">AI Confidence</span>
              <Badge variant={data?.confidence > 0.8 ? 'success' : 'warning'}>
                {(data?.confidence * 100).toFixed(0)}%
              </Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}


