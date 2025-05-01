lint:
	golangci-lint run

install-tools:
	curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/v2.1.5/install.sh | sh -s -- -b $$(go env GOPATH)/bin v2.1.5

.PHONY: lint install-tools
