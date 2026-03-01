class ShortsController < ApplicationController
  def index
    @short = Short.new
    @shorts = Short.all
  end

  def create
    result = Shorts::CreateService.call(**short_params.to_h.symbolize_keys)

    if result.success?
      redirect_to(shorts_path)
    else
      @shorts = Short.all
      @short = result.errors[:validation]

      render(:index, status: :unprocessable_entity)
    end
  end

  def destroy
    @short = Short.find(params[:id])
    @short.destroy

    redirect_to shorts_path
  end

  private

  def short_params
    params.expect(short: [ :original_url ])
  end
end
