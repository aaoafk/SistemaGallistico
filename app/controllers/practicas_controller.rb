# app/controllers/practicas_controller.rb
class PracticasController < ApplicationController
  before_action :set_practica, only: [ :show, :destroy ]

  def index
    # For now, let's scope practices to a specific gallo if provided
    if params[:gallo_id]
      @gallo = Gallo.find(params[:gallo_id])
      @practicas = @gallo.practicas
    else
      @practicas = Practica.all
    end
  end

  def new
    @practica = Practica.new
  end

  def show
    # The @practica instance variable is set by the before_action
  end

  def destroy
    @practica.destroy

    respond_to do |format|
      format.html { redirect_to practicas_path, notice: "Practica borrado exitosamente." }
    end
  end

  private


  def set_practica
    @practica = Practica.find(params[:id])
  end
end
