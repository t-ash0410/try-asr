package handlers

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"

	speech "cloud.google.com/go/speech/apiv1"
	"github.com/quic-go/webtransport-go"

	"tryhttp3/app/internal/speachtotext"
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

		s, err := speachtotext.SpeechToText(ctx, spc, func() (io.Reader, error) {
			stream, err := conn.AcceptUniStream(ctx)
			if err != nil {
				log.Printf("Failed to accept stream: %s\n", err)
				return nil, io.EOF
			}
			return stream, nil
		})
		if err != nil {
			log.Printf("Failed to speech to text: %s\n", err)
			w.WriteHeader(500)
			return
		}

		fmt.Println("Result:", s)
	}
}
