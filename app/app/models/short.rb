# Short is the short link for some (long) URL
class Short < ApplicationRecord
  validates :token, :original_url, :expire_at, presence: true
  validates :token, length: { is: 6 }

  # TODO: this can't be validated at the data layer, so consider moving it to specifc forms
  validates :original_url, long_url: true
end
