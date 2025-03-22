import { useEffect, useRef, useState } from 'react'

const wssUrl = 'wss://localhost:8080/ws'

export function QuicButton() {
  const [recording, setRecording] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  useEffect(() => {
    if (!recording) return

    async function startRecording() {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      wsRef.current = new WebSocket(wssUrl)
      wsRef.current.onopen = () => console.log('WebSocket connected')
      wsRef.current.onerror = (err) => console.error('WebSocket error', err)

      mediaRecorder.ondataavailable = (event) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(event.data)
        }
      }

      mediaRecorder.start(500)
      mediaRecorderRef.current = mediaRecorder
    }

    startRecording()

    return () => {
      mediaRecorderRef.current?.stop()
      wsRef.current?.close()
    }
  }, [recording])

  return (
    <button
      type="button"
      onClick={() => setRecording((prev) => !prev)}
      className="rounded-full bg-blue-500 hover:bg-blue-600 hover:cursor-pointer text-white px-4 py-2"
    >
      {recording ? 'Stop' : 'Start with QUIC'}
    </button>
  )
}
