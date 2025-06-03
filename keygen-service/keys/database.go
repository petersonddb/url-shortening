package keys

import (
	"errors"
	"fmt"
	"keygen-service/app"

	"github.com/valkey-io/valkey-glide/go/api"
)

const (
	KeysListName      = "keys"
	TakenKeysListName = "takenKeys"
)

type Valkey struct{}

// Create persists a new key
func (k *Valkey) Create(i interface{}) error {
	newKey, ok := i.(*ShortKey)
	if !ok {
		return fmt.Errorf("i is not a valid shortkey")
	}

	builtApp, err := app.GetApp()
	if err != nil {
		return fmt.Errorf("failed to get app: %w", err)
	}

	client, err := builtApp.GetKeyValueDb().Client.GetConn()
	if err != nil {
		return fmt.Errorf("failed to connect to db: %w", err)
	}

	valkeyClient, ok := client.(api.GlideClientCommands)
	if !ok {
		return errors.New("incompatible db client")
	}
	defer valkeyClient.Close()

	if added, err := valkeyClient.SAdd(KeysListName, []string{string(newKey[:])}); added < 1 || err != nil {
		if err == nil {
			err = errors.New("already exist")
		}
		return fmt.Errorf("failed to push to db: %w", err)
	}

	return nil
}

// AllocateFirst moves the first available key
// to an unavailables set and returns that key
func (k *Valkey) AllocateFirst() (interface{}, error) {
	builtApp, err := app.GetApp()
	if err != nil {
		return nil, fmt.Errorf("failed to get app: %w", err)
	}

	client, err := builtApp.GetKeyValueDb().Client.GetConn()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to db: %w", err)
	}

	valkeyClient, ok := client.(api.GlideClientCommands)
	if !ok {
		return nil, errors.New("incompatible db client")
	}
	defer valkeyClient.Close()

	res, err := valkeyClient.SPop(KeysListName)
	if err != nil {
		return nil, fmt.Errorf("failed to get a key: %w", err)
	}

	if res.Value() == "" {
		return nil, errors.New("no available keys, try again in a moment")
	}

	if added, err := valkeyClient.SAdd(TakenKeysListName, []string{res.Value()}); added < 1 || err != nil {
		if err == nil {
			err = errors.New("already exist")
		}
		return nil, fmt.Errorf("failed to mark key as allocated: %w", err)
	}

	movedKey := ShortKey([]byte(res.Value()))
	if !ok {
		return nil, fmt.Errorf("incompatible result type: %w", err)
	}

	return movedKey, nil
}

// Deallocate moves the given key back to a availables set
func (k *Valkey) Deallocate(i interface{}) error {
	key, ok := i.(*ShortKey)
	if !ok {
		return errors.New("incompatible key type")
	}

	builtApp, err := app.GetApp()
	if err != nil {
		return fmt.Errorf("failed to get app: %w", err)
	}

	client, err := builtApp.GetKeyValueDb().Client.GetConn()
	if err != nil {
		return fmt.Errorf("failed to connect to db: %w", err)
	}

	valkeyClient, ok := client.(api.GlideClientCommands)
	if !ok {
		return fmt.Errorf("incompatible db client: %w", err)
	}
	defer valkeyClient.Close()

	if found, err := valkeyClient.SMove(TakenKeysListName, KeysListName, string(key[:])); !found || err != nil {
		if err == nil {
			err = errors.New("key not found")
		}
		return fmt.Errorf("failed to deallocate the key: %w", err)
	}

	return nil
}
