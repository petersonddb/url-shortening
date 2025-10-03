# ---- Build Stage ----
FROM golang:1.24-trixie AS builder

WORKDIR /app

# Copy go.mod and go.sum first (for caching dependencies)
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source
COPY . .

# Build the binary (static, stripped)
RUN go build -o keygen-app .

# ---- Run Stage ----
FROM debian:trixie

# TODO: Add CA certificates (for HTTPS calls)

WORKDIR /app
COPY --from=builder /app/keygen-app .

EXPOSE 8080
ENTRYPOINT ["./keygen-app"]
