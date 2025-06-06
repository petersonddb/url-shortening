package keys

import (
	"context"
	"errors"
	"fmt"
	"keygen-service/app"
	"log"
)

// RPCHandler handles requests over keys
type RPCHandler struct {
	UnimplementedKeysServer
}

// NewRPCHandler returns a ready-to-use RPCHandler
func NewRPCHandler() KeysServer {
	return &RPCHandler{}
}

func (s *RPCHandler) GetKey(_ context.Context, _ *Void) (*KeyResponse, error) {
	log.Println("keys.GetKey RPC called")

	builtApp, err := app.GetApp()
	if err != nil {
		return nil, fmt.Errorf("internal error: %w", err)
	}

	log.Println("keys.GetKey allocating key")
	i, err := builtApp.GetKeyValueDb().Keys.AllocateFirst()
	if err != nil {
		return nil, fmt.Errorf("internal error: %w", err)
	}

	k, ok := i.(ShortKey)
	if !ok {
		err := errors.New("could not convert allocated value into a key")

		return nil, fmt.Errorf("internal error: %w", err)
	}

	log.Printf("keys.GetKey responded with key %v (%s)", k, k)
	return &KeyResponse{Key: k.Bytes()}, nil
}

func (s *RPCHandler) ReleaseKey(_ context.Context, req *KeyRequest) (*Void, error) {
	log.Printf("keys.ReleaseKey RPC called for key %v (%s)", req.Key, req.Key)

	builtApp, err := app.GetApp()
	if err != nil {
		return nil, fmt.Errorf("internal error: %w", err)
	}

	k, err := NewKeyFromBytes(req.Key)
	if err != nil {
		return nil, fmt.Errorf("validation error: %w", err)
	}

	log.Printf("keys.ReleaseKey deallocating key %v (%s)", k, k)
	if err := builtApp.GetKeyValueDb().Keys.Deallocate(k); err != nil {
		return nil, fmt.Errorf("internal error: %w", err)
	}

	log.Println("keys.ReleaseKey responded")
	return &Void{}, nil
}
