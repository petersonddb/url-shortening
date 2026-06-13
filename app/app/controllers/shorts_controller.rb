# frozen_string_literal: true

class ShortsController < ApplicationController
  def index
    @short_form = Shorts::CreateForm.new
    @shorts = Short.all
  end

  def create
    @short_form = Shorts::CreateForm.new(**short_params.to_h.symbolize_keys)

    if @short_form.save
      redirect_to(shorts_path)
    else
      @shorts = Short.all

      render(:index, status: :unprocessable_entity)
    end
  end

  def destroy
    @short = Short.find(params[:id])
    # TODO: do not destroy the short this way, we will lose the token forever
    @short.destroy!

    redirect_to shorts_path
  end

  private

  def short_params
    params.expect(short: [ :original_url ])
  end
end
