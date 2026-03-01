# frozen_string_literal: true

# LongUrlValidator determines whether a URL can really be considered long
class LongUrlValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    record.errors.add(attribute, :invalid) unless compliant?(value)
  end

  private

  def compliant?(value)
    uri = URI.parse(value)

    uri.host.present? && uri.path.present?
  rescue
    false
  end
end
