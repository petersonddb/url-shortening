package keys

import (
	"context"
	"fmt"
	"keygen-service/app"
	"keygen-service/databases"
	"slices"
	"strings"
	"testing"
)

func setUp() error {
	appConfig := app.Configuration{
		KeyValueDb: &app.KeyValueDb{
			Host:   "localhost",
			Port:   6380,
			Client: &databases.ValkeyClient{},
			Keys:   &Valkey{},
		},
	}

	if err := app.Initialize(appConfig); err != nil {
		return fmt.Errorf("app failed to initialize: %w", err)
	}

	// flush is not supported by valkey client;
	// this should change in v2;
	// clean it manually for now!

	// testApp, err := app.GetApp()
	// if err != nil {
	// 	return fmt.Errorf("failed to get test app: %w", err)
	// }

	// if err := testApp.GetKeyValueDb().Client.Flush(); err != nil {
	// 	return fmt.Errorf("failed to clean db: %w", err)
	// }

	return nil
}

func TestHandler(t *testing.T) {
	if err := setUp(); err != nil {
		t.Fatalf("test app failed to initialize: %v", err)
	}

	testApp, err := app.GetApp()
	if err != nil {
		t.Fatalf("could not get test app: %v", err)
	}

	availableKeys := []string{"testk1", "testk2"}
	takenKeys := []string{}

	for _, k := range availableKeys {
		key, errs := NewKeyFromBytes([]byte(k))
		if len(errs) != 0 {
			t.Fatalf("invalid generated test keys: %v", errs)
		}

		if err := testApp.GetKeyValueDb().Keys.Create(key); err != nil {
			t.Fatalf("could not create test keys: %v", err)
		}
	}

	handler := NewRPCHandler()

	t.Run("TestGetKey_GivenSomeAvailableKeys", func(t *testing.T) {
		for len(availableKeys) > 0 {
			res, err := handler.GetKey(context.Background(), &Void{})
			if err != nil {
				t.Fatalf("GetKey failed: %v", err)
			}

			if !slices.Contains(availableKeys, string(res.Key)) {
				t.Errorf("GetKey() = %v, want any in %v", res, availableKeys)
			}

			takenKeys = append(takenKeys, string(res.Key))
			i := slices.Index(availableKeys, string(res.Key))
			availableKeys = append(availableKeys[:i], availableKeys[i+1:]...)
		}
	})

	t.Run("TestGetKey_GivenNoAvailableKeys", func(t *testing.T) {
		res, err := handler.GetKey(context.Background(), &Void{})
		if err == nil {
			t.Fatalf("GetKey() = %v, want an error", res)
		}
	})

	t.Run("TestReleaseKey_GivenSomeUnavailableKey", func(t *testing.T) {
		for len(takenKeys) > 0 {
			k := takenKeys[len(takenKeys)-1]
			takenKeys = takenKeys[:len(takenKeys)-1]

			_, err := handler.ReleaseKey(context.Background(), &KeyRequest{Key: []byte(k)})
			if err != nil {
				t.Fatalf("ReleaseKey() failed: %v", err)
			}
		}
	})

	t.Run("TestReleaseKey_GivenNoAvailableKeys", func(t *testing.T) {
		res, err := handler.ReleaseKey(context.Background(), &KeyRequest{Key: []byte("anykey")})
		if err == nil {
			t.Fatalf("ReleaseKey() = %v, want an error", res)
		}

		want := "not found"
		if !strings.Contains(err.Error(), want) {
			t.Errorf("ReleaseKey() = %v, want %v", err, want)
		}
	})
}
