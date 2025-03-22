import { useEffect, useRef, useState } from 'react'

const quicUrl = 'https://localhost:8080/wt'

export function WebTransportButton() {
  const [recording, setRecording] = useState(false)
  const transportRef = useRef<WebTransport | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (!recording) return

    async function startRecording() {
      transportRef.current = new WebTransport(quicUrl)
      await transportRef.current.ready

      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      mediaRecorderRef.current = new MediaRecorder(mediaStreamRef.current, {
        mimeType: 'audio/webm',
      })
      mediaRecorderRef.current.ondataavailable = async (event) => {
        const transport = transportRef.current
        if (!transport || event.data.size < 1) {
          return
        }

        const buf = await event.data.arrayBuffer()
        const stream = await transport.createUnidirectionalStream()
        const writer = stream.getWriter()
        await writer.write(buf)
        await writer.close()
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

    transportRef.current?.close()
    for (const track of mediaStreamRef.current?.getTracks() ?? []) {
      track.stop()
    }
    transportRef.current = null

    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null
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
