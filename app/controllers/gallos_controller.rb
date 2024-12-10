class GallosController < ApplicationController
  def index
    @gallos = Gallo.all
  end
end
