package main

import (
	"keygen-service/keys"
	"log"
	"net"
	"time"

	"google.golang.org/grpc"
)

func main() {
	if err := Initialize(); err != nil {
		log.Fatal("could not initialize the application: ", err)
	}

	launchKeysGenerator() // failures here aren't fatal to the service

	if err := startKeysRPCServer(); err != nil {
		log.Fatal("failed to start keys server: ", err)
	}
}

func launchKeysGenerator() {
	ch := make(chan error)
	go keys.GenerateKeys(keys.NextKey, time.Second, ch)

	go func() {
		for e := range ch {
			log.Printf("keys generator sent a error: %v", e)
		}
		log.Println("keys generator closed with an error")
	}()
}

func startKeysRPCServer() error {
    // #nosec G102
	lis, err := net.Listen("tcp", "0.0.0.0:8080")
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
