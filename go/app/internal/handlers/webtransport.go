package handlers

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"tryhttp3/app/internal/speeachtotext"

	speech "cloud.google.com/go/speech/apiv1"
	"github.com/quic-go/webtransport-go"
)

func HandleRecording(s *webtransport.Server, spc *speech.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()

		conn, err := s.Upgrade(w, r)
		if err != nil {
			log.Printf("Failed to upgrade: %s\n", err)
			w.WriteHeader(500)
			return
		}

		stream, err := speeachtotext.NewStream(r.Context(), spc)
		if err != nil {
			fmt.Println("Failed to create stream:", err)
			return
		}

		for {
			reader, err := conn.AcceptUniStream(ctx)
			if err != nil {
				log.Printf("Failed to accept stream: %s\n", err)
				break
			}
			audio, err := io.ReadAll(reader)
			if err != nil {
				log.Printf("Failed to read audio: %s\n", err)
				return
			}
			if err := speeachtotext.SendAudio(stream, audio); err != nil {
				fmt.Println("Failed to send audio:", err)
				return
			}
		}

		s, err := speeachtotext.Result(stream)
		if err != nil {
			fmt.Println("Failed to get result:", err)
			return
		}
		fmt.Println("Result:", s)
	}
}
