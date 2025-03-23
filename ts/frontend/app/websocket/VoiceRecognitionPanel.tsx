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
      return 'bg-green-500'
    case ConnectionState.CLOSED:
      return 'bg-gray-500'
    case ConnectionState.WAITING_CLOSE:
      return 'bg-yellow-500'
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
    <div className="flex flex-col gap-4 p-4 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(connectionState)}`}
        >
          {getStatusText(connectionState)}
        </span>
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

      <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={`${message.timestamp.getTime()}-${message.text}`}
            className="p-2 bg-gray-50 rounded"
          >
            <div className="text-xs text-gray-500">
              {message.timestamp.toLocaleTimeString()}
            </div>
            <div className="text-sm text-gray-700">{message.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
