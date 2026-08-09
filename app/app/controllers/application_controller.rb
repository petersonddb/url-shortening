# frozen_string_literal: true

class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  around_action :switch_locale

  private

  LOCALE_COOKIE = :locale

  def switch_locale(&action)
    locale = LocaleResolver.resolve(
      cookie_locale: cookies[LOCALE_COOKIE],
      accept_language_header: request.env["HTTP_ACCEPT_LANGUAGE"]
    )

    persist_locale(locale)
    I18n.with_locale(locale, &action)
  end

  def persist_locale(locale)
    return if cookies[LOCALE_COOKIE] == locale

    cookies.permanent[LOCALE_COOKIE] = locale
  end
end
