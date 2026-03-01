class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  around_action :switch_locale

  private

  def switch_locale(&action)
    locale = params[:locale]&.to_s || ""
    locale = I18n.default_locale unless I18n.locale_available?(locale)

    I18n.with_locale(locale, &action)
  end
end
