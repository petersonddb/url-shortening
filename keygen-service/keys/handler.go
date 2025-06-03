package keys

import (
	"context"
	"errors"
	"fmt"
	"keygen-service/app"
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
	builtApp, err := app.GetApp()
	if err != nil {
		return nil, fmt.Errorf("internal error: %w", err)
	}

	i, err := builtApp.GetKeyValueDb().Keys.AllocateFirst()
	if err != nil {
		return nil, fmt.Errorf("internal error: %w", err)
	}

	k, ok := i.(ShortKey)
	if !ok {
		err := errors.New("could not convert allocated value into a key")

		return nil, fmt.Errorf("internal error: %w", err)
	}

	return &KeyResponse{Key: k.Bytes()}, nil
}

func (s *RPCHandler) ReleaseKey(_ context.Context, req *KeyRequest) (*Void, error) {
	builtApp, err := app.GetApp()
	if err != nil {
		return nil, fmt.Errorf("internal error: %w", err)
	}

	k, errs := NewKeyFromBytes(req.Key)
	if len(errs) != 0 {
		return nil, fmt.Errorf("internal error: %w", err)
	}

	if err := builtApp.GetKeyValueDb().Keys.Deallocate(k); err != nil {
		return nil, fmt.Errorf("internal error: %w", err)
	}

	return &Void{}, nil
}
