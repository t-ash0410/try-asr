import { Mic, Square } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { ConnectionState, useWebSocketRecorder } from './useWebSocketRecorder'

interface Message {
  text: string
  timestamp: Date
}

const getStatusText = (state: ConnectionState) => {
  switch (state) {
    case ConnectionState.OPEN:
      return '聞き取り中'
    case ConnectionState.CLOSED:
      return '発言待ち'
    case ConnectionState.WAITING_CLOSE:
      return '解析中'
  }
}

const getStatusColor = (state: ConnectionState) => {
  switch (state) {
    case ConnectionState.OPEN:
      return 'from-emerald-500 to-emerald-400'
    case ConnectionState.CLOSED:
      return 'from-violet-400 to-violet-500'
    case ConnectionState.WAITING_CLOSE:
      return 'from-yellow-500 to-yellow-400'
  }
}

const getStatusRingColor = (state: ConnectionState) => {
  switch (state) {
    case ConnectionState.OPEN:
      return 'ring-emerald-500/20'
    case ConnectionState.CLOSED:
      return 'ring-violet-400/20'
    case ConnectionState.WAITING_CLOSE:
      return 'ring-yellow-500/20'
  }
}

export function VoiceRecognitionPanel() {
  const [messages, setMessages] = useState<Message[]>([])
  const { recording, connectionState, startRecording, stopRecording } =
    useWebSocketRecorder({
      onMessage: (text) => {
        setMessages((prev) => [...prev, { text, timestamp: new Date() }])
      },
    })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full bg-gradient-to-r ${getStatusColor(connectionState)} shadow-lg ring-4 ${getStatusRingColor(connectionState)}`}
          />
          <span className="text-sm font-medium bg-gradient-to-r from-foreground/90 to-foreground/60 bg-clip-text text-transparent">
            {getStatusText(connectionState)}
          </span>
        </div>
        <Button
          variant={recording ? 'destructive' : 'default'}
          size="icon"
          onClick={() => (recording ? stopRecording() : startRecording())}
          className="ml-auto"
        >
          {recording ? (
            <Square className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* メッセージリスト */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-secondary/20 via-accent/20 to-primary/20 rounded-lg blur-md" />
        <div className="relative">
          <div className="max-h-[400px] overflow-y-auto space-y-3 p-1">
            {messages.map((message) => (
              <div
                key={`${message.timestamp.getTime()}-${message.text}`}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="mt-1 text-sm text-foreground/90">
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
