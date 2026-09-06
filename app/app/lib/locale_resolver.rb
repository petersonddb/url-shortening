# frozen_string_literal: true

# Resolves the locale to use for a request from the Accept-Language header,
# falling back to the app default when no supported language is requested.
class LocaleResolver
  def self.resolve(...)
    new(...).resolve
  end

  def initialize(accept_language_header:)
    @accept_language_header = accept_language_header
  end

  # Always returns an available locale String.
  def resolve
    accept_language_locale || I18n.default_locale.to_s
  end

  private

  attr_reader :accept_language_header

  # Returns the best available locale String matched from the Accept-Language
  # header, or nil when none of the requested languages are supported.
  def accept_language_locale
    return if accept_language_header.blank?

    ranked_languages.filter_map { |language| available_locale(language) }.first
  end

  # Parses the Accept-Language header into languages ordered by descending quality.
  def ranked_languages
    accept_language_header.split(",").filter_map do |part|
      language, quality = part.strip.split(";q=")
      next if language.blank?

      [language.strip.tr("_", "-"), (quality || "1").to_f]
    end.sort_by { |_, quality| -quality }.map(&:first)
  end

  # Matches a candidate (e.g. "pt-BR") against the available locales, falling
  # back to a language-only match (e.g. "pt" -> "pt-BR").
  # Returns an available locale String, or nil when there's no match.
  def available_locale(candidate)
    return if candidate.blank?

    return candidate if I18n.locale_available?(candidate)

    language = candidate.split("-").first
    I18n.available_locales.map(&:to_s).find { |locale| locale.split("-").first == language }
  end
end
