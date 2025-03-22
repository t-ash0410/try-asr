package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	speech "cloud.google.com/go/speech/apiv1"
	"github.com/gorilla/websocket"

	"tryhttp3/app/internal"
)

func handleHealth(w http.ResponseWriter, req *http.Request) {
	fmt.Printf("client from : %s\n", req.RemoteAddr)
	fmt.Fprintf(w, "ok\n")
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func handleWebSocket(spc *speech.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			fmt.Println("WebSocket upgrade failed:", err)
			return
		}
		defer conn.Close()

		getReader := func() (io.Reader, error) {
			_, reader, err := conn.NextReader()
			if err != nil {
				fmt.Println("Failed to get reader:", err)
				return nil, io.EOF
			}
			return reader, nil
		}

		s, err := internal.SpeechToText(r.Context(), spc, getReader)
		if err != nil {
			fmt.Println("Failed to speech to text:", err)
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
	)

	spc, err := speech.NewClient(context.Background())
	if err != nil {
		log.Fatal(err)
	}
	defer spc.Close()

	mux := http.NewServeMux()
	mux.Handle("/health", http.HandlerFunc(handleHealth))
	mux.Handle("/ws", http.HandlerFunc(handleWebSocket(spc)))

	server := http.Server{
		Addr:    fmt.Sprintf("localhost:%s", port),
		Handler: mux,
	}

	log.Printf("Listening on %s", server.Addr)

	if err := server.ListenAndServeTLS(cfp, kfp); err != nil {
		log.Fatal(err)
	}
}
