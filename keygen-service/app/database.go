package app

// KeyValueEntity represents a set of methods over
// an entity at a key-value database
type KeyValueEntity interface {
	TTT() error
}

// KeyValueDb holds key-value concrete database implementations
// and configuration
type KeyValueDb struct {
	Host string
	Port int16

	Keys KeyValueEntity
}
