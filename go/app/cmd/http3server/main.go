package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/quic-go/quic-go"
	"github.com/quic-go/quic-go/http3"
	"github.com/quic-go/quic-go/qlog"
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

	server := http3.Server{
		Addr: fmt.Sprintf("localhost:%s", port),
		QUICConfig: &quic.Config{
			Tracer: qlog.DefaultConnectionTracer,
		},
		Handler: mux,
	}

	log.Printf("Listening on %s", server.Addr)

	// docker run --rm keioni/curl-http3 curl -v -L -s --http3 https://localhost:6060/
	err := server.ListenAndServeTLS(cfp, kfp)
	if err != nil {
		log.Fatal(err)
	}
}
