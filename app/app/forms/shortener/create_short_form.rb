# frozen_string_literal: true

# Shortener::CreateShortForm using given original url preparing with
# the token to be used in the short link
class Shortener::CreateShortForm
  include ActiveModel::Model

  class TokenUnavailable < StandardError; end

  attr_reader :original_url

  validates :original_url, presence: true
  validates :original_url, long_url: true, allow_blank: true

  def initialize(original_url:, repository:)
    @original_url = original_url
    @repository = repository

    @short = Shortener::Short.new(original_url:)
  end

  def save
    return false unless valid?

    set_defaults
    allocate_token
    persist_short
  end

  private

  def set_defaults
    @short.expire_at = Time.zone.today + 1.year
  end

  def allocate_token
    token = @repository.allocate
    raise TokenUnavailable, "No token available for short creation" unless token

    @short.token = token
  end

  def persist_short
    return true if @short.save

    @short.errors.each do |error|
      errors.add(error.attribute, error.message)
    end

    false
  end
end
