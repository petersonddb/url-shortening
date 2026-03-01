# frozen_string_literal: true

module Shorts
  # Shorts::CreateService using given originalUrl preparing with
  # the token to be used in the short link
  class CreateService < ApplicationService
    def initialize(original_url:)
      @original_url = original_url
    end

    def run
      short = Short.new(original_url: @original_url, token: "123456")

      return success(short) if short.save

      failure({ validation: short })
    end

    private

    def success(short)
      Result.new(success?: true, record: short, errors: nil)
    end

    def failure(errors)
      Result.new(success?: false, record: nil, errors: errors)
    end
  end
end
