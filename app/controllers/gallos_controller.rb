class GallosController < ApplicationController
  def index
    @q = Gallo.ransack(params[:q])
    @gallos = @q.result(distinct: true)
  end

  def show
    @gallo = Gallo.find(params[:id])
  end

  def edit
    @gallo = Gallo.find(params[:id])
  end

  def update
    @gallo = Gallo.find(params[:id])
    if @gallo.update(gallo_params)
      redirect_to gallo_path(@gallo), notice: "Gallo actualizado exitosamente!"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def new
    @gallo = Gallo.new
  end

  def create
    @gallo = Gallo.new(gallo_params)
    @gallo.user = User.first

    if @gallo.save
      respond_to do |format|
        format.html { redirect_to gallos_path, notice: "Gallo creado exitosamente." }
      end
    else
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    @gallo = Gallo.find(params[:id])
    @gallo.destroy

    respond_to do |format|
      format.html { redirect_to gallos_path, notice: "Gallo eliminado exitosamente." }
    end
  end

  private

  def gallo_params
    params.require(:gallo).permit(:banda_de_ala, :weight_pounds, :weight_ounces, :genero, :apodo)
  end
end
