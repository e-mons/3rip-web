'use client'

import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Booking } from '@/lib/types'

// Mapbox access token should be in environment variables
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

interface MapboxMapProps {
  center: { lat: number; lng: number }
  zoom?: number
  trips?: Booking[]
  selectedTripId?: string | null
  onTripSelect?: (id: string) => void
}

export default function MapboxMap({ 
  center, 
  zoom = 12, 
  trips = [], 
  selectedTripId,
  onTripSelect 
}: MapboxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({})

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (!mapboxgl.accessToken) return

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1', // Premium dark style
      center: [center.lng, center.lat],
      zoom: zoom,
      pitch: 45, // Tilted view for premium feel
      antialias: true
    })

    map.on('load', () => {
      mapRef.current = map
      
      // Add a simple terrain/3D building effect
      map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update Markers when trips change
  useEffect(() => {
    const currentMap = mapRef.current
    if (!currentMap) return

    // Clean up old markers not in the current trips list
    Object.keys(markersRef.current).forEach(id => {
      if (!trips.find(t => t.id === id)) {
        markersRef.current[id].remove()
        delete markersRef.current[id]
      }
    })

    // Add or update markers
    trips.forEach(trip => {
      const location = trip.driver?.current_location || { lat: center.lat, lng: center.lng }
      const heading = trip.driver?.heading || 0

      if (markersRef.current[trip.id]) {
        // Update existing marker position and rotation
        markersRef.current[trip.id].setLngLat([location.lng, location.lat])
        
        // Update rotation of the custom element
        const element = markersRef.current[trip.id].getElement()
        const carIcon = element.querySelector('.car-icon') as HTMLElement
        if (carIcon) carIcon.style.transform = `rotate(${heading - 45}deg)`
        
        // Highlight if selected
        if (trip.id === selectedTripId) {
          element.classList.add('selected-marker')
        } else {
          element.classList.remove('selected-marker')
        }
      } else {
        // Create custom marker element
        const el = document.createElement('div')
        el.className = 'custom-marker'
        el.innerHTML = `
          <div class="marker-container ${trip.id === selectedTripId ? 'selected-marker' : ''}">
            <div class="car-icon-wrapper">
              <div class="car-icon" style="transform: rotate(${heading - 45}deg)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" fill="white" stroke="white" />
                </svg>
              </div>
            </div>
            <div class="pulse-ring"></div>
          </div>
        `

        el.addEventListener('click', () => {
          if (onTripSelect) onTripSelect(trip.id)
        })

        // Add marker to map
        const marker = new mapboxgl.Marker(el)
          .setLngLat([location.lng, location.lat])
          .addTo(currentMap)

        markersRef.current[trip.id] = marker
      }
    })
  }, [trips, selectedTripId])

  // Fly to selected trip
  useEffect(() => {
    if (!mapRef.current || !selectedTripId) return
    const trip = trips.find(t => t.id === selectedTripId)
    if (!trip?.driver?.current_location) return

    mapRef.current.flyTo({
      center: [trip.driver.current_location.lng, trip.driver.current_location.lat],
      zoom: 15,
      essential: true,
      duration: 2000
    })
  }, [selectedTripId])

  return (
    <>
      <style jsx global>{`
        .custom-marker {
          cursor: pointer;
          transition: transform 0.2s;
        }
        .marker-container {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #444;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          transition: all 0.3s;
        }
        .selected-marker .marker-container {
          background: #00A9A4;
          transform: scale(1.2);
          ring: 4px solid rgba(0, 169, 164, 0.2);
        }
        .car-icon-wrapper {
          position: relative;
          z-index: 2;
        }
        .car-icon {
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid #00A9A4;
          border-radius: 50%;
          opacity: 0;
          animation: marker-pulse 2s infinite;
        }
        @keyframes marker-pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
      <div ref={mapContainerRef} className="w-full h-full rounded-[40px]" />
      {!mapboxgl.accessToken && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-50 rounded-[40px]">
          <p className="text-white font-bold italic">MAPBOX_ACCESS_TOKEN REQUIRED</p>
        </div>
      )}
    </>
  )
}
