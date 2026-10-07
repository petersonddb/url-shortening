# URL Shortening Service

## Development

Start token generation:

```sh
docker compose up -d token-repository
bin/sidekiq
```

Sidekiq uses `REDIS_URL` (default: `redis://localhost:6379/0`). The token
repository uses `TOKEN_REPOSITORY_REDIS_URL` (default: `redis://localhost:6379/1`).
