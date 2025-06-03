package keys

import "errors"

type ShortKey [6]byte

func (s *ShortKey) Bytes() []byte {
	return s[:]
}

// NewKeyFromBytes creates a short key from given
// bytes if it represents a valid content, validation
// errors otherwise
func NewKeyFromBytes(content []byte) (*ShortKey, []error) {
	var shortKey ShortKey
	errs := make([]error, 0)

	if len(content) != len(ShortKey{}) {
		errs = append(errs, errors.New("invalid key size"))
	}

	if len(errs) == 0 {
		shortKey = ShortKey(content)
	}

	return &shortKey, errs
}
