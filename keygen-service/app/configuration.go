package app

import (
	"errors"
)

// App holds configuration common to the entire application
type App interface {
	GetKeyValueDb() *KeyValueDb
}

type builtApp struct {
	conf Configuration
}

func (a *builtApp) GetKeyValueDb() *KeyValueDb {
	return a.conf.KeyValueDb
}

// Configuration common to the entire application
type Configuration struct {
	KeyValueDb *KeyValueDb
}

// Initialize is a one-time initialization of
// the app Configuration required at runtime,
// it errors when called twice
func Initialize(c Configuration) error {
	if app != nil {
		return errors.New("application already initialized")
	}

	app = &builtApp{conf: c}
	return nil
}

var app App

// GetApp returns an App that should have been
// initialized at the application start, otherwise
// an error asking for initialization
func GetApp() (App, error) {
	if app == nil {
		return nil, errors.New("app not initialized")
	}

	return app, nil
}
