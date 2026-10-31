# frozen_string_literal: true

class Shortener::Redis::TokenRepository
  AVAILABLE_KEY = "token_repository:available"
  UNAVAILABLE_KEY = "token_repository:unavailable"

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
    loop do
      result = @client.watch(UNAVAILABLE_KEY) do
        if @client.sismember(UNAVAILABLE_KEY, token)
          @client.unwatch
          false
        else
          @client.multi { |transaction| transaction.sadd(AVAILABLE_KEY, token) }
        end
      end

      return false if result == false
      return result.first == 1 if result
    end
  end

  def allocate
    loop do
      token = @client.srandmember(AVAILABLE_KEY)
      return nil unless token

      return token if @client.smove(AVAILABLE_KEY, UNAVAILABLE_KEY, token)
    end
  end
end
