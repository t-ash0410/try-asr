import { useEffect, useRef, useState } from 'react'

const quicUrl = 'https://localhost:8080/wt'

export function WebTransportButton() {
  const [recording, setRecording] = useState(false)
  const transportRef = useRef<WebTransport | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const streamRef = useRef<WritableStreamDefaultWriter | null>(null)

  useEffect(() => {
    if (!recording) return

    async function startRecording() {
      transportRef.current = new WebTransport(quicUrl)
      await transportRef.current.ready

      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      streamRef.current = transportRef.current.datagrams.writable.getWriter()

      mediaRecorderRef.current = new MediaRecorder(mediaStreamRef.current, {
        mimeType: 'audio/webm',
      })
      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          await streamRef.current?.write(event.data)
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

    mediaRecorderRef.current?.stop()
    streamRef.current?.close()
    transportRef.current?.close()
    for (const track of mediaStreamRef.current?.getTracks() ?? []) {
      track.stop()
    }
  }

  return (
    <button
      type="button"
      onClick={() => (recording ? stopRecording() : startRecording())}
      className="rounded-full bg-blue-500 hover:bg-blue-600 hover:cursor-pointer text-white px-4 py-2"
    >
      {recording ? 'Stop' : 'Start with QUIC'}
    </button>
  )
}
