package app

// KeyValueDbClient represents common operations
// into a key-value database
type KeyValueDbClient interface {
	// GetConn return a connection to the key-value db
	// where we run commands
	GetConn() (interface{}, error)

	// Flush erases all data
	Flush() error
}

// KeyValueEntity represents a set of methods over
// an entity at a key-value databases
type KeyValueEntity interface {
	// Create save new instance to db
	Create(interface{}) error

	// AllocateFirst moves the first found value
	// between collections and return it
	AllocateFirst() (interface{}, error)

	// Deallocate makes the given element
	// available again
	Deallocate(interface{}) error
}

// KeyValueDb holds key-value concrete databases implementations
// and configuration
type KeyValueDb struct {
	Host   string
	Port   int16
	Client KeyValueDbClient
	Keys   KeyValueEntity
}
