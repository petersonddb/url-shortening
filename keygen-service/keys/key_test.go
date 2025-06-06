package keys

import (
	"errors"
	"slices"
	"strings"
	"testing"
)

func TestNewKeyFromBytes_GivenValidContent(t *testing.T) {
	content := []byte("abc123")
	got, err := NewKeyFromBytes(content)

	if err != nil {
		t.Errorf("NewKeyFromBytes(%v) = (%v, %v), want no errors", content, got, err)
	}
}

func TestNewKeyFromBytes_GivenInvalidContent(t *testing.T) {
	cases := []struct {
		content []byte
		want    []string
	}{
		{[]byte("ab1/"), []string{"small key size", "not URL safe"}},
		{[]byte("abcd12@4"), []string{"big key size", "not URL safe"}},
		{[]byte("abcd1234"), []string{"big key size"}}, // single error
	}

	for _, c := range cases {
		got, err := NewKeyFromBytes(c.content)

		if err == nil {
			t.Fatalf("NewKeyFromBytes(%v) = (%v, %v), want some errors", c.content, got, err)
		}

		var validationError ShortKeyValidationError
		if !errors.As(err, &validationError) {
			t.Fatalf("NewKeyFromBytes(%v) = (%v, %v), want validation error", c.content, got, err)
		}

		for _, w := range c.want {
			if !slices.ContainsFunc(validationError.Entries, func(e ShortKeyValidationEntry) bool {
				return e.Field == "key" && strings.Contains(e.Error.Error(), w)
			}) {
				t.Errorf("NewKeyFromBytes(%v) = (%v, %v), want error containing %v (specifically %v)", c.content, got, err, c.want, w)
			}
		}
	}
}
