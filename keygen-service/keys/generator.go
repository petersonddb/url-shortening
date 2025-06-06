package keys

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"keygen-service/app"
	"time"
)

// GenerateKeys should be launched in its own
// goroutine where it will use the generator function
// to create new keys indefinitely
func GenerateKeys(generator func() (*ShortKey, error), interval time.Duration, ch chan error) {
	builtApp, err := app.GetApp()
	if err != nil {
		ch <- fmt.Errorf("failed to get app: %w", err)
		close(ch)

		return
	}

	for {
		newKey, err := generator()
		if err != nil {
			ch <- fmt.Errorf("failed to generate key: %w", err)
		}

		if err := builtApp.GetKeyValueDb().Keys.Create(newKey); err != nil {
			ch <- fmt.Errorf("failed to create key: %w", err)
		}

		time.Sleep(interval)
	}
}

// NextKey generates 6-bytes URL safe short keys encoded in base64
func NextKey() (*ShortKey, error) {
	bytes := make([]byte, 6)

	_, err := rand.Read(bytes)
	if err != nil { // this should never happen
		return nil, fmt.Errorf("failed to create random bytes: %w", err)
	}

	encodedBytes := make([]byte, base64.URLEncoding.EncodedLen(len(bytes)))
	base64.URLEncoding.Encode(encodedBytes, bytes)

	key, err := NewKeyFromBytes(encodedBytes[:6])
	if err != nil {
		return key, fmt.Errorf("failed key validation: %w", err)
	}

	return key, nil
}
