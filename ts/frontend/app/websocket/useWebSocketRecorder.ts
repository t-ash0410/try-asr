import { useEffect, useRef, useState } from 'react'
import { useSilenceDetector } from '~/hooks/useSilenceDetector'

const wssUrl = 'wss://localhost:8080/ws'

export enum ConnectionState {
  OPEN = 'open',
  CLOSED = 'closed',
  WAITING_CLOSE = 'waiting_close',
}

export interface UseWebSocketRecorderOptions {
  onMessage: (message: string) => void
  silenceThreshold?: number
  silenceTime?: number
}

export function useWebSocketRecorder({
  onMessage,
  silenceThreshold = -45,
  silenceTime = 1.0,
}: UseWebSocketRecorderOptions) {
  const [recording, setRecording] = useState(false)
  const [connectionState, setConnectionState] = useState(ConnectionState.CLOSED)
  const connectionStateRef = useRef(ConnectionState.CLOSED)

  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    connectionStateRef.current = connectionState
  }, [connectionState])

  const { startListening, stopListening } = useSilenceDetector({
    threshold: silenceThreshold,
    silenceTime,
    onSilenceEnd: () => {
      if (connectionStateRef.current !== ConnectionState.OPEN) return false
      wsRef.current?.send('waitResult')
      setConnectionState(ConnectionState.WAITING_CLOSE)
      return true
    },
    onRestart: () => {
      if (connectionStateRef.current !== ConnectionState.CLOSED) return false
      start()
      return true
    },
  })

  async function start() {
    if (connectionStateRef.current !== ConnectionState.CLOSED) return

    wsRef.current = new WebSocket(wssUrl)
    wsRef.current.onmessage = (event) => {
      onMessage(event.data)
    }
    wsRef.current.onclose = () => {
      stop()
    }

    streamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })

    mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
      mimeType: 'audio/webm',
    })
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (connectionStateRef.current !== ConnectionState.OPEN) return

      const ws = wsRef.current
      if (!ws || ws.readyState !== WebSocket.OPEN || event.data.size < 1) {
        return
      }

      ws.send(event.data)
    }
    mediaRecorderRef.current.start(500)

    setConnectionState(ConnectionState.OPEN)
  }

  function stop() {
    if (connectionStateRef.current === ConnectionState.CLOSED) return

    for (const track of streamRef.current?.getTracks() ?? []) {
      track.stop()
    }
    streamRef.current = null

    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null

    wsRef.current?.close()
    wsRef.current = null

    setConnectionState(ConnectionState.CLOSED)
  }

  async function startRecording() {
    setRecording(true)
    startListening()
    start()
  }

  async function stopRecording() {
    setRecording(false)
    stopListening()
    stop()
  }

  return {
    recording,
    connectionState,
    startRecording,
    stopRecording,
  }
}
