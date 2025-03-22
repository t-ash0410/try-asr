package main

import (
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"tryhttp3/app/internal"

	speech "cloud.google.com/go/speech/apiv1"
	"github.com/quic-go/quic-go/http3"
	"github.com/quic-go/webtransport-go"
)

func handleRecording(s *webtransport.Server, spc *speech.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()

		conn, err := s.Upgrade(w, r)
		if err != nil {
			log.Printf("Failed to upgrade: %s\n", err)
			w.WriteHeader(500)
			return
		}

		s, err := internal.SpeechToText(ctx, spc, func() (io.Reader, error) {
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

func main() {
	var (
		port = os.Getenv("PORT")
		cfp  = os.Getenv("CERT_FILE_PATH")
		kfp  = os.Getenv("KEY_FILE_PATH")
		addr = fmt.Sprintf(":%s", port)
	)

	cert, err := tls.LoadX509KeyPair(cfp, kfp)
	if err != nil {
		log.Fatal("Failed to load TLS certificates:", err)
	}

	s := &webtransport.Server{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
		H3: http3.Server{
			Addr: addr,
			TLSConfig: &tls.Config{
				Certificates: []tls.Certificate{cert},
				NextProtos:   []string{"h3"},
			},
		},
	}
	defer s.Close()

	spc, err := speech.NewClient(context.Background())
	if err != nil {
		log.Fatal("Failed to create speech client:", err)
	}
	defer spc.Close()

	http.HandleFunc("/wt", handleRecording(s, spc))

	log.Printf("Listening on %s\n", addr)

	if err := s.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
