# Short is the short link for some (long) URL
class Short < ApplicationRecord
  attribute :expire_at, default: -> { Time.zone.today + 1.year }

  validates :token, :original_url, :expire_at, presence: true
  validates :token, length: { is: 6 }
  validates :original_url, long_url: true
end
