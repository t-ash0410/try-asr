package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/quic-go/quic-go/http3"
)

func handler(w http.ResponseWriter, req *http.Request) {
	fmt.Printf("client from : %s\n", req.RemoteAddr)
	fmt.Fprintf(w, "hello\n")
}

func main() {
	var (
		port = os.Getenv("PORT")
		cfp  = os.Getenv("CERT_FILE_PATH")
		kfp  = os.Getenv("KEY_FILE_PATH")
	)

	mux := http.NewServeMux()
	mux.Handle("/", http.HandlerFunc(handler))

	addr := fmt.Sprintf(":%s", port)

	log.Printf("Listening on %s", addr)

	if err := http3.ListenAndServeTLS(addr, cfp, kfp, mux); err != nil {
		log.Fatal(err)
	}
}
