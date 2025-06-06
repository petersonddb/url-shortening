package keys

import (
	"errors"
	"keygen-service/app"
	"strings"
	"testing"
	"time"
)

type keyValueClientMock struct{}

func (c *keyValueClientMock) GetConn() (interface{}, error) { return nil, nil }
func (c *keyValueClientMock) Flush() error                  { return nil }

type unimplementedKeyValueEntityMock struct{}

func (e *unimplementedKeyValueEntityMock) Create(_ interface{}) error {
	return errors.New("uimplemented create")
}

func (e *unimplementedKeyValueEntityMock) AllocateFirst() (interface{}, error) {
	return nil, errors.New("uimplemented allocate first")
}

func (e *unimplementedKeyValueEntityMock) Deallocate(_ interface{}) error {
	return errors.New("uimplemented deallocate")
}

type keyValueEntityMock struct {
	unimplementedKeyValueEntityMock

	createdKeys []*ShortKey
}

func (e *keyValueEntityMock) Create(i interface{}) error {
	k, ok := i.(*ShortKey)
	if !ok {
		return errors.New("incompatible key")
	}

	e.createdKeys = append(e.createdKeys, k)

	return nil
}

func TestGenerateKeys_GivenAppNotInitialized(t *testing.T) {
	want := "app not initialized"
	got := make(chan error)

	go GenerateKeys(func() (*ShortKey, error) { return nil, nil }, time.Nanosecond, got)

	select {
	case e := <-got:
		if !strings.Contains(e.Error(), want) {
			t.Errorf("GenerateKeys() sent %v, want %v", e.Error(), want)
		}
	case <-time.After(time.Millisecond):
		t.Errorf("GenerateKeys() timed out, want error containing %v", want)
	}
}

func TestGenerateKeys_GivenFailingGenerator(t *testing.T) {
	testConfig := app.Configuration{
		KeyValueDb: &app.KeyValueDb{
			Host:   "testhost",
			Port:   0,
			Client: &keyValueClientMock{},
			Keys:   &unimplementedKeyValueEntityMock{},
		},
	}

	if err := app.Initialize(testConfig); err != nil {
		t.Fatalf("app failed to initialize: %v", err)
	}

	ch := make(chan error)
	go GenerateKeys(
		func() (*ShortKey, error) {
			return nil, errors.New("failing generator")
		},
		time.Nanosecond,
		ch,
	)

	select {
	case e := <-ch:
		want := "failed to generate key"
		if !strings.Contains(e.Error(), want) {
			t.Errorf("GenerateKeys() sent %v, want containing %v", e.Error(), want)
		}
	case <-time.After(time.Millisecond):
		t.Error("GenerateKeys() timed out, want it to send a error")
	}
}

func TestGenerateKeys_GivenFailingDb(t *testing.T) {
	testConfig := app.Configuration{
		KeyValueDb: &app.KeyValueDb{
			Host:   "testhost",
			Port:   0,
			Client: &keyValueClientMock{},
			Keys:   &unimplementedKeyValueEntityMock{},
		},
	}

	if err := app.Initialize(testConfig); err != nil {
		t.Fatalf("app failed to initialize: %v", err)
	}

	ch := make(chan error)
	go GenerateKeys(NextKey, time.Nanosecond, ch)

	select {
	case e := <-ch:
		want := "failed to create key"
		if !strings.Contains(e.Error(), want) {
			t.Errorf("GenerateKeys() sent %v, want containing %v", e.Error(), want)
		}
	case <-time.After(time.Millisecond):
		t.Error("GenerateKeys() timed out, want it to send a error")
	}
}

func TestGenerateKeys_GivenWorkingSetup(t *testing.T) {
	kvEntityMock := keyValueEntityMock{}

	testConfig := app.Configuration{
		KeyValueDb: &app.KeyValueDb{
			Host:   "testhost",
			Port:   0,
			Client: &keyValueClientMock{},
			Keys:   &kvEntityMock,
		},
	}

	if err := app.Initialize(testConfig); err != nil {
		t.Fatalf("app failed to initialize: %v", err)
	}

	ch := make(chan error)
	go GenerateKeys(NextKey, time.Nanosecond, ch)

	select {
	case e := <-ch:
		t.Errorf("GenerateKeys() sent %v, want no errors", e)
	case <-time.After(time.Millisecond):
		if len(kvEntityMock.createdKeys) == 0 {
			t.Error("GenerateKeys() timed out, want a created key")
		}
	}
}

func TestNextKey(t *testing.T) {
	got, err := NextKey()
	if err != nil {
		t.Fatalf("NextKey() = (%v, %v), want no errors", got, err)
	}
}
