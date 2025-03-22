import { useEffect, useRef, useState } from 'react'

const quicUrl = 'https://localhost:8080/quic'

export function QuicButton() {
  const [recording, setRecording] = useState(false)
  const transportRef = useRef<WebTransport | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<WritableStreamDefaultWriter | null>(null)

  useEffect(() => {
    if (!recording) return

    async function startRecording() {
      transportRef.current = new WebTransport(quicUrl)
      await transportRef.current.ready

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      const writer = transportRef.current.datagrams.writable.getWriter()
      streamRef.current = writer

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          await writer.write(event.data)
        }
      }

      mediaRecorder.start(500)
      mediaRecorderRef.current = mediaRecorder
    }

    startRecording()

    return () => {
      mediaRecorderRef.current?.stop()
      streamRef.current?.close()
      transportRef.current?.close()
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
