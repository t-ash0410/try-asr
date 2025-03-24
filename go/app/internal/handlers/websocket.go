package handlers

import (
	"fmt"
	"net/http"

	speech "cloud.google.com/go/speech/apiv1"
	"cloud.google.com/go/speech/apiv1/speechpb"
	"github.com/gorilla/websocket"

	"tryasr/app/internal/speeachtotext"
)

const (
	processControlMessageWaitResult = "waitResult"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func HandleWebSocket(spc *speech.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("WebSocket connection received")

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			fmt.Println("WebSocket upgrade failed:", err)
			return
		}
		defer conn.Close()

		stream, err := speeachtotext.NewStream(r.Context(), spc)
		if err != nil {
			fmt.Println("Failed to create stream:", err)
			return
		}
		for {
			_, message, err := conn.ReadMessage()
			if websocket.IsCloseError(err,
				websocket.CloseNormalClosure,
				websocket.CloseGoingAway,
				websocket.CloseNoStatusReceived,
			) {
				break
			}
			if err != nil {
				fmt.Println("Failed to read message:", err)
				break
			}

			if string(message) == "waitResult" {
				if err := sendResult(conn, stream); err != nil {
					fmt.Println("Failed to send result:", err)
					break
				}
				break
			}
			if err := speeachtotext.SendAudio(stream, message); err != nil {
				fmt.Println("Failed to send audio:", err)
				break
			}
		}

		fmt.Println("WebSocket closed")
	}
}

func sendResult(conn *websocket.Conn, stream speechpb.Speech_StreamingRecognizeClient) error {
	ret, err := speeachtotext.Result(stream)
	if err != nil {
		return err
	}
	if err := conn.WriteMessage(websocket.TextMessage, []byte(ret)); err != nil {
		return err
	}
	return nil
}
