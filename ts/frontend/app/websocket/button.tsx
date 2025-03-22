import { useEffect, useRef, useState } from 'react'

const wssUrl = 'wss://localhost:8080/ws'

export function WebSocketButton() {
  const [recording, setRecording] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (!recording) return

    async function startRecording() {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      wsRef.current = new WebSocket(wssUrl)
      wsRef.current.onopen = () => console.log('WebSocket connected')
      wsRef.current.onerror = (err) => console.error('WebSocket error', err)

      mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm',
      })
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(event.data)
        }
      }
      mediaRecorderRef.current.start(500)
    }

    startRecording()

    return () => {
      stopRecording()
    }
  }, [recording])

  async function startRecording() {
    setRecording(true)
  }

  async function stopRecording() {
    setRecording(false)

    wsRef.current?.close()
    mediaRecorderRef.current?.stop()
    for (const track of streamRef.current?.getTracks() ?? []) {
      track.stop()
    }
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
