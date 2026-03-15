# frozen_string_literal: true

# Shorts::CreateForm using given originalUrl preparing with
# the token to be used in the short link
class Shorts::CreateForm
  include ActiveModel::Model

  attr_accessor :original_url

  validate :validate_short

  def initialize(original_url: nil)
    @short = Short.new(original_url: original_url)
  end

  def save
    @short.token = "123456"
    @short.expire_at = Time.zone.today + 1.year

    return unless valid?

    @short.save
  end

  def extract = @short

  private

  def validate_short
    unless @short.valid?
      @short.errors.each do |error|
        errors.add(error.attribute, error.message)
      end
    end
  end
end
