package main

import (
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"log"
	"os"

	"github.com/quic-go/quic-go"
)

func handleQUIC(conn quic.Connection) {
	for {
		stream, err := conn.AcceptUniStream(nil)
		if err != nil {
			log.Println("Failed to accept stream:", err)
			return
		}

		file, err := os.Create("audio.webm")
		if err != nil {
			log.Println("Failed to create file:", err)
			return
		}
		defer file.Close()

		_, err = io.Copy(file, stream)
		if err != nil {
			log.Println("Error writing to file:", err)
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
	cfg := &tls.Config{
		Certificates: []tls.Certificate{cert},
		NextProtos:   []string{"h3"},
	}

	listener, err := quic.ListenAddr(addr, cfg, nil)
	if err != nil {
		log.Fatal("QUIC listener error:", err)
	}

	fmt.Printf("QUIC server listening on %s\n", addr)

	for {
		conn, err := listener.Accept(context.Background())
		if err != nil {
			log.Println("Accept error:", err)
			continue
		}
		go handleQUIC(conn)
	}
}
