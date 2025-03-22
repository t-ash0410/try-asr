package main

import (
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/quic-go/quic-go/http3"
	"github.com/quic-go/webtransport-go"
)

func handleRecording(sess *webtransport.Session) {
	file, err := os.Create("audio.webm")
	if err != nil {
		log.Printf("Failed to create file: %s\n", err)
		return
	}
	defer file.Close()

	for {
		ctx := context.Background()

		stream, err := sess.AcceptUniStream(ctx)
		if err != nil {
			log.Printf("Failed to accept stream: %s\n", err)
			return
		}

		if _, err := io.Copy(file, stream); err != nil {
			log.Printf("Error writing to file: %s\n", err)
			return
		}
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

	http.HandleFunc("/wt", func(w http.ResponseWriter, r *http.Request) {
		conn, err := s.Upgrade(w, r)
		if err != nil {
			log.Printf("Failed to upgrade: %s\n", err)
			w.WriteHeader(500)
			return
		}

		handleRecording(conn)
	})

	log.Printf("Listening on %s\n", addr)

	if err := s.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
