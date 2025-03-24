package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	speech "cloud.google.com/go/speech/apiv1"

	"tryasr/app/internal/handlers"
)

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
	mux.Handle("/health", http.HandlerFunc(handlers.HandleHealth))
	mux.Handle("/ws", handlers.HandleWebSocket(spc))

	server := http.Server{
		Addr:    fmt.Sprintf("localhost:%s", port),
		Handler: mux,
	}

	log.Printf("Listening on %s", server.Addr)

	if err := server.ListenAndServeTLS(cfp, kfp); err != nil {
		log.Fatal(err)
	}
}
