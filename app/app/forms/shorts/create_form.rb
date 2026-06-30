# frozen_string_literal: true

# Shorts::CreateForm using given original_url preparing with
# the token to be used in the short link
class Shorts::CreateForm
  include ActiveModel::Model

  delegate :original_url, to: :short

  validate :validate_short

  def initialize(original_url: nil)
    @short = Short.new(original_url: original_url)
  end

  def save
    set_defaults
    return false unless valid?

    @short.save
  end

  private

  attr_accessor :short

  def set_defaults
    # TODO: use real token from a token service
    @short.token = "123456"

    @short.expire_at = Time.zone.today + 1.year
  end

  def validate_short
    unless @short.valid?
      @short.errors.each do |error|
        errors.add(error.attribute, error.message)
      end
    end
  end
end
