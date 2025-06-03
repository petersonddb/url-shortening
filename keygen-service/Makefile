lint:
	golangci-lint run

install-tools: install-linter install-protobuf

install-linter:
	curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/v2.1.5/install.sh | sh -s -- -b $$(go env GOPATH)/bin v2.1.5

install-protobuf:
    curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v31.0/protoc-31.0-osx-aarch_64.zip
	unzip protoc-31.0-osx-aarch_64.zip -d /usr/local
	rm protoc-31.0-osx-aarch_64.zip
	go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.36.6
	go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.5.1


.PHONY: lint install-tools
