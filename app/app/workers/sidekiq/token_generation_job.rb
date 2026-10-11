# frozen_string_literal: true

class TokenGenerationJob
  include Sidekiq::Job

  sidekiq_options queue: :token_generation

  def perform
    Tokens::Generator.new(repository:).generate
  end

  private

  def repository
    Redis::TokenRepository.new
  end
end
