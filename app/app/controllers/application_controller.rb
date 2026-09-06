# frozen_string_literal: true

class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  around_action :switch_locale

  private

  def switch_locale(&action)
    locale = LocaleResolver.resolve(
      accept_language_header: request.headers["Accept-Language"]
    )

    I18n.with_locale(locale, &action)
  end
end
