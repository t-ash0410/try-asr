package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
)

func handleHealth(w http.ResponseWriter, req *http.Request) {
	fmt.Printf("client from : %s\n", req.RemoteAddr)
	fmt.Fprintf(w, "ok\n")
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("WebSocket upgrade failed:", err)
		return
	}
	defer conn.Close()

	file, err := os.Create("audio.webm")
	if err != nil {
		fmt.Println("Failed to create file:", err)
		return
	}
	defer file.Close()

	for {
		_, data, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Error reading message:", err)
			break
		}
		_, err = file.Write(data)
		if err != nil {
			fmt.Println("Error writing to file:", err)
			break
		}
	}
}

func main() {
	var (
		port = os.Getenv("PORT")
		cfp  = os.Getenv("CERT_FILE_PATH")
		kfp  = os.Getenv("KEY_FILE_PATH")
	)

	mux := http.NewServeMux()
	mux.Handle("/health", http.HandlerFunc(handleHealth))
	mux.Handle("/ws", http.HandlerFunc(handleWebSocket))

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
