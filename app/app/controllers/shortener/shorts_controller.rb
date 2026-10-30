# frozen_string_literal: true

class Shortener::ShortsController < ApplicationController
  def index
    @short_form = Shortener::CreateShortForm.new(original_url: nil, repository: token_repository)
    @shorts = Shortener::Short.all
  end

  def create
    @short_form = Shortener::CreateShortForm.new(original_url: short_params[:original_url], repository: token_repository)

    if @short_form.save
      redirect_to(shorts_path)
    else
      @shorts = Shortener::Short.all

      render(:index, status: :unprocessable_entity)
    end
  rescue Shortener::CreateShortForm::TokenUnavailable => error
    Rails.logger.error(error.message)

    raise
  end

  def destroy
    @short = Shortener::Short.find(params[:id])
    # TODO: do not destroy the short this way, we will lose the token forever
    @short.destroy!

    redirect_to shorts_path
  end

  private

  def token_repository
    Shortener::Redis::TokenRepository.new
  end

  def short_params
    params.expect(short: [ :original_url ])
  end
end
