# frozen_string_literal: true

class Redis
  class TokenRepository
    KEY = "token_repository:available"

    def self.default_client
      @default_client ||= ::Redis.new(url: redis_url)
    end

    def self.redis_url
      ENV.fetch("TOKEN_REPOSITORY_REDIS_URL", "redis://localhost:6379/1")
    end

    def initialize(client: self.class.default_client)
      @client = client
    end

    def store(token)
      @client.sadd(KEY, token)
    end
  end
end
