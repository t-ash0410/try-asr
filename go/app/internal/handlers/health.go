package handlers

import (
	"fmt"
	"net/http"
)

func HandleHealth(w http.ResponseWriter, req *http.Request) {
	fmt.Printf("client from : %s\n", req.RemoteAddr)
	fmt.Fprintf(w, "ok\n")
}
