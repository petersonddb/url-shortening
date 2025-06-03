package main

import (
	"keygen-service/keys"
	"log"
	"net"

	"google.golang.org/grpc"
)

func main() {
	if err := Initialize(); err != nil {
		log.Fatal("could not initialize the application: ", err)
	}

	if err := startKeysRPCServer(); err != nil {
		log.Fatal("failed to start keys server: ", err)
	}
}

func startKeysRPCServer() error {
	lis, err := net.Listen("tcp", "127.0.0.1:8080")
	if err != nil {
		return err
	}

	s := grpc.NewServer()
	keys.RegisterKeysServer(s, keys.NewRPCHandler())

	log.Printf("server listening at %v", lis.Addr())
	if err := s.Serve(lis); err != nil {
		return err
	}

	return nil
}
