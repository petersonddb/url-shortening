# frozen_string_literal: true

class ShortsController < ApplicationController
  def index
    @short_form = Shorts::CreateForm.new(original_url: nil, repository: token_repository)
    @shorts = Short.all
  end

  def create
    @short_form = Shorts::CreateForm.new(original_url: short_params[:original_url], repository: token_repository)

    if @short_form.save
      redirect_to(shorts_path)
    else
      @shorts = Short.all

      render(:index, status: :unprocessable_entity)
    end
  rescue Shorts::CreateForm::TokenUnavailable => error
    Rails.logger.error(error.message)

    head :internal_server_error
  end

  def destroy
    @short = Short.find(params[:id])
    # TODO: do not destroy the short this way, we will lose the token forever
    @short.destroy!

    redirect_to shorts_path
  end

  private

  def token_repository
    Redis::TokenRepository.new
  end

  def short_params
    params.expect(short: [ :original_url ])
  end
end
