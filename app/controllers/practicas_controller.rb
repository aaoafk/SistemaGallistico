# app/controllers/practicas_controller.rb
class PracticasController < ApplicationController
  before_action :set_practica, only: [:show]

  def index
    # For now, let's scope practices to a specific gallo if provided
    if params[:gallo_id]
      @gallo = Gallo.find(params[:gallo_id])
      @practicas = @gallo.practicas
    else
      @practicas = Practica.all
    end
  end
  def show
    # The @practica instance variable is set by the before_action
  end
  private 

  def set_practica
    @practica = Practica.find(params[:id])
  end
end
