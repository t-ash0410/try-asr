import { useEffect, useRef, useState } from 'react'

const wssUrl = 'wss://localhost:8080/ws'

export function App() {
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
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <div className="max-w-[300px] w-full space-y-6 px-4">
          <nav className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4">
            Start recording with websocket
          </nav>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setRecording((prev) => !prev)}
            className="rounded-full bg-blue-500 hover:bg-blue-600 hover:cursor-pointer text-white px-4 py-2"
          >
            {recording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>
      </div>
    </main>
  )
}
