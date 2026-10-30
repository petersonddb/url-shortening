# Shortener::Short is the short link for some (long) URL
class Shortener::Short < ApplicationRecord
  validates :token, :original_url, :expire_at, presence: true
  validates :token, length: { is: 6 }, if: -> { self.token.present? }
end
