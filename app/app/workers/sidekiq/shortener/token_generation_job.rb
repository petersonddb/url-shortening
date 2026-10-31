# frozen_string_literal: true

class Shortener::TokenGenerationJob
  include Sidekiq::Job

  sidekiq_options queue: :token_generation

  def perform
    Shortener::TokenGenerator.new(repository:).generate
  end

  private

  def repository
    Shortener::Redis::TokenRepository.new
  end
end
