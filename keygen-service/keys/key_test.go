package keys

import (
	"strings"
	"testing"
)

func TestNewKeyFromBytes_GivenValidContent(t *testing.T) {
	content := []byte("abc123")
	got, errs := NewKeyFromBytes(content)

	if len(errs) != 0 {
		t.Errorf("NewKeyFromBytes(%v) = (%v, %v), want no errors", content, got, errs)
	}
}

func TestNewKeyFromBytes_GivenInvalidSizeContent(t *testing.T) {
	want := "invalid key size"
	cases := [][]byte{[]byte("ab1"), []byte("abcd1234")}

	for _, c := range cases {
		got, errs := NewKeyFromBytes(c)

		if len(errs) == 0 {
			t.Fatalf("NewKeyFromBytes(%v) = (%v, %v), want some errors", c, got, errs)
		}

		if !strings.Contains(errs[0].Error(), want) {
			t.Errorf("NewKeyFromBytes(%v) = (%v, %v), want to contain %v", c, got, errs, want)
		}
	}
}
