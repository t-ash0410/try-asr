package handlers

import (
	"fmt"
	"io"
	"net/http"

	speech "cloud.google.com/go/speech/apiv1"
	"github.com/gorilla/websocket"

	"tryhttp3/app/internal/speachtotext"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func HandleWebSocket(spc *speech.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			fmt.Println("WebSocket upgrade failed:", err)
			return
		}
		defer conn.Close()

		s, err := speachtotext.SpeechToText(r.Context(), spc, getReader(conn))
		if err != nil && err != io.EOF {
			fmt.Println("Failed to speech to text:", err)
			return
		}
		fmt.Println("Result:", s)
	}
}

func getReader(conn *websocket.Conn) speachtotext.GetReaderFunc {
	return func() (io.Reader, error) {
		_, reader, err := conn.NextReader()
		if websocket.IsCloseError(err,
			websocket.CloseNormalClosure,
			websocket.CloseGoingAway,
			websocket.CloseNoStatusReceived,
		) {
			return nil, io.EOF
		}
		if err != nil {
			return nil, err
		}
		return reader, nil
	}
}
