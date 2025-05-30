package app

import (
	"strings"
	"testing"
)

func TestInitialize_GivenAlreadyInitialized(t *testing.T) {
	if err := Initialize(Configuration{}); err != nil {
		t.Fatalf("Initialize() failed: %v", err)
	}

	want := "already initialized"

	gotErr := Initialize(Configuration{})

	if gotErr == nil {
		t.Fatal("Initialize() error = nil, want some error")
	}

	if !strings.Contains(gotErr.Error(), want) {
		t.Errorf("Initialize() error contains %v, want %v", gotErr.Error(), want)
	}
}

func TestGetApp_GivenNotInitialized(t *testing.T) {
	want := "not initialized"

	got, gotErr := GetApp()

	if gotErr == nil {
		t.Fatal("GetApp() error = nil, want some error")
	}

	if !strings.Contains(gotErr.Error(), want) {
		t.Errorf("GetApp() error contains %v, want %v", gotErr.Error(), want)
	}

	if got != nil {
		t.Errorf("GetApp() = %v, want nil", got)
	}
}

func TestGetApp_GivenInitialized(t *testing.T) {
	if err := Initialize(Configuration{}); err != nil {
		t.Fatalf("Initialize() failed: %v", err)
	}

	got, err := GetApp()
	if err != nil {
		t.Fatalf("GetApp() failed: %v", err)
	}

	if got == nil {
		t.Errorf("GetApp() = nil, want an app")
	}
}
