package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
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

	server := http.Server{
		Addr:    fmt.Sprintf("localhost:%s", port),
		Handler: mux,
	}

	log.Printf("Listening on %s", server.Addr)

	err := server.ListenAndServeTLS(cfp, kfp)
	if err != nil {
		log.Fatal(err)
	}
}
