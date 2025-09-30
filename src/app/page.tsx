'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface RealtimeEvent {
  id: string
  timestamp: string
  type: string
  table: string
  schema: string
  old_record?: any
  new_record?: any
}

export default function Home() {
  const [isListening, setIsListening] = useState(false)
  const [events, setEvents] = useState<RealtimeEvent[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')

  const startListening = async () => {
    try {
      setConnectionStatus('connecting')
      setIsListening(true)

      // Subscribe to all PostgreSQL changes
      const channel = supabase
        .channel('postgres_changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public', // Listen to public schema
            table: '*', // Listen to all tables
          },
          (payload) => {
            console.log('Received realtime event:', payload)

            const newEvent: RealtimeEvent = {
              id: `${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString(),
              type: payload.eventType,
              table: payload.table,
              schema: payload.schema,
              old_record: payload.old_record,
              new_record: payload.new_record,
            }

            setEvents(prev => [newEvent, ...prev.slice(0, 49)]) // Keep last 50 events
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status)
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected')
          } else if (status === 'CHANNEL_ERROR') {
            setConnectionStatus('disconnected')
            setIsListening(false)
          }
        })

      // Store channel reference for cleanup
      ;(window as any).realtimeChannel = channel

    } catch (error) {
      console.error('Error starting realtime listener:', error)
      setConnectionStatus('disconnected')
      setIsListening(false)
    }
  }

  const stopListening = () => {
    const channel = (window as any).realtimeChannel
    if (channel) {
      supabase.removeChannel(channel)
      ;(window as any).realtimeChannel = null
    }
    setIsListening(false)
    setConnectionStatus('disconnected')
  }

  const clearEvents = () => {
    setEvents([])
  }

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      const channel = (window as any).realtimeChannel
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])


  return (
    <div className="container">
      <h1 className="title">Supabase Realtime Test</h1>

      <button
        onClick={isListening ? stopListening : startListening}
        className={`button ${isListening ? 'stop' : ''}`}
      >
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>

      <div className={`status ${connectionStatus}`}>
        Status: {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
      </div>

      <div className="events-container">
        <h2>Realtime Events ({events.length})</h2>

        {events.length === 0 ? (
          <div className="no-events">
            <p>No events received yet.</p>
            <p>Click "Start Listening" and make changes to your database to see real-time events here.</p>
          </div>
        ) : (
          <div>
            {events.map((event) => (
              <div key={event.id} className="event">
                <div className="event-header">
                  <div>
                    <span className={`event-type ${event.type.toLowerCase()}`}>
                      {event.type}
                    </span>
                    <span> {event.schema}.{event.table}</span>
                  </div>
                  <span className="event-time">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {event.new_record && (
                  <div>
                    <p><strong>New Record:</strong></p>
                    <pre className="event-data">
                      {JSON.stringify(event.new_record, null, 2)}
                    </pre>
                  </div>
                )}

                {event.old_record && (
                  <div>
                    <p><strong>Old Record:</strong></p>
                    <pre className="event-data">
                      {JSON.stringify(event.old_record, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
