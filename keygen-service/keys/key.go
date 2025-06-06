package keys

import (
	"errors"
	"fmt"
	"regexp"
)

var (
	UrlSafePattern = regexp.MustCompile(`^[a-zA-Z0-9_-]*$`)
)

// ShortKey is a URL-safe 6-byte key
type ShortKey [6]byte

func (s *ShortKey) Bytes() []byte {
	return s[:]
}

// ShortKeyValidationError aggregates errors found
// during creation of a new short key
type ShortKeyValidationError struct {
	Entries []ShortKeyValidationEntry
}

// ShortKeyValidationEntry describes a validation
// error in the short key
type ShortKeyValidationEntry struct {
	Field string
	Error error
}

func (s ShortKeyValidationError) Error() string {
	return fmt.Sprintf("short key validation errors: %v", s.Entries)
}

// Valid indicates when errors were found
func (s *ShortKeyValidationError) Valid() bool {
	return len(s.Entries) == 0
}

// NewKeyFromBytes creates a short key from given
// bytes if it represents a valid content, returns
// validation an error otherwise
func NewKeyFromBytes(content []byte) (*ShortKey, error) {
	var validation ShortKeyValidationError

	validateBytes(content, &validation)

	if !validation.Valid() {
		return nil, validation
	}

	shortKey := ShortKey(content)
	return &shortKey, nil
}

func validateBytes(content []byte, v *ShortKeyValidationError) {
	validations := []func(content []byte, v *ShortKeyValidationError){
		validateBytesSize,
		validateBytesUrlSafe,
	}

	for _, f := range validations {
		f(content, v)
	}
}

func validateBytesSize(content []byte, v *ShortKeyValidationError) {
	if len(content) != len(ShortKey{}) {
		size := "big"
		if len(content) < len(ShortKey{}) {
			size = "small"
		}

		v.Entries = append(
			v.Entries, ShortKeyValidationEntry{"key", fmt.Errorf("%s key size", size)})
	}
}

func validateBytesUrlSafe(content []byte, v *ShortKeyValidationError) {
	if !UrlSafePattern.Match(content) {
		v.Entries = append(
			v.Entries, ShortKeyValidationEntry{"key", errors.New("not URL safe")})
	}
}
