package main

import (
	"context"
	"crypto/tls"
	"fmt"
	"log"
	"net/http"
	"os"

	speech "cloud.google.com/go/speech/apiv1"
	"github.com/quic-go/quic-go/http3"
	"github.com/quic-go/webtransport-go"

	"tryhttp3/app/internal/handlers"
)

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

	http.HandleFunc("/wt", handlers.HandleRecording(s, spc))

	log.Printf("Listening on %s\n", addr)

	if err := s.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
