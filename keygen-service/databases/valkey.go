package databases

import (
	"errors"
	"fmt"
	"keygen-service/app"

	"github.com/valkey-io/valkey-glide/go/api"
)

type ValkeyClient struct{}

// GetConn returns a valkey client for
// commands execution
func (v *ValkeyClient) GetConn() (interface{}, error) {
	builtApp, err := app.GetApp()
	if err != nil {
		return nil, fmt.Errorf("failed to get app: %w", err)
	}

	config := api.NewGlideClientConfiguration().WithAddress(
		&api.NodeAddress{Host: builtApp.GetKeyValueDb().Host, Port: int(builtApp.GetKeyValueDb().Port)})

	client, err := api.NewGlideClient(config)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to valkey: %w", err)
	}

	if _, err := client.Ping(); err != nil {
		client.Close()
		return nil, fmt.Errorf("failed to contact valkey: %w", err)
	}

	return client, nil
}

// Flush always return an error:
// flush isn't supported in valkey client yet;
// this should change in v2
func (v *ValkeyClient) Flush() error {
	return errors.New("not implemented")
}
