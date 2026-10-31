# frozen_string_literal: true

require "base64"
require "securerandom"

class Shortener::TokenGenerator
  BYTE_LENGTH = 6
  TOKEN_LENGTH = 6

  def initialize(repository:)
    @repository = repository
  end

  def generate
    token = Base64.urlsafe_encode64(SecureRandom.random_bytes(BYTE_LENGTH), padding: false).first(TOKEN_LENGTH)

    return token if @repository.store(token)

    Rails.logger.warn("Token generation collision")
    nil
  end
end
