package main

import (
	"fmt"
	"keygen-service/app"
	"keygen-service/databases"
	"keygen-service/keys"
)

// Initialize the application with necessary
// configurations
func Initialize() error {
	configuration := app.Configuration{}

	setKeyValueDB(&configuration)

	err := app.Initialize(configuration)
	if err != nil {
		return fmt.Errorf("error initializing app: %w", err)
	}

	return nil
}

func setKeyValueDB(configuration *app.Configuration) {
	configuration.KeyValueDb = &app.KeyValueDb{
		Host:   "localhost",
		Port:   6379,
		Client: &databases.ValkeyClient{},
		Keys:   &keys.Valkey{},
	}
}
