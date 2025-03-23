import { useEffect, useRef, useState } from 'react'
import useSilenceDetector from '~/hooks/useSilenceDetector'

const wssUrl = 'wss://localhost:8080/ws'

export function WebSocketButton() {
  const [recording, setRecording] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const { startListening, stopListening } = useSilenceDetector({
    threshold: -45,
    silenceTime: 1.0,
    onSilenceEnd: () => {
      const ws = wsRef.current
      if (!ws) {
        return
      }
      stopRecorder()
      ws.send('waitResult')
    },
    onRestart: () => {
      startRecorder()
    },
  })

  useEffect(() => {
    if (!recording) return

    connect()
    startListening()

    return () => {
      stopRecording()
    }
  }, [recording, startListening])

  async function connect() {
    wsRef.current = new WebSocket(wssUrl)
    wsRef.current.onmessage = (event) => {
      console.log('received message', event.data)
    }
    await startRecorder()
  }

  async function startRecorder() {
    streamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })
    mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
      mimeType: 'audio/webm',
    })
    mediaRecorderRef.current.ondataavailable = (event) => {
      const ws = wsRef.current
      if (!ws || ws.readyState !== WebSocket.OPEN || event.data.size < 1) {
        return
      }
      ws.send(event.data)
    }
    mediaRecorderRef.current.start(500)
  }

  function stopRecorder() {
    for (const track of streamRef.current?.getTracks() ?? []) {
      track.stop()
    }
    streamRef.current = null

    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null
  }

  async function startRecording() {
    setRecording(true)
  }

  async function stopRecording() {
    setRecording(false)
    stopRecorder()
    wsRef.current?.close()
    wsRef.current = null
    stopListening()
  }

  return (
    <button
      type="button"
      onClick={() => (recording ? stopRecording() : startRecording())}
      className="rounded-full bg-blue-500 hover:bg-blue-600 hover:cursor-pointer text-white px-4 py-2"
    >
      {recording ? 'Stop' : 'Start with WebSocket'}
    </button>
  )
}
