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

    respond_to do |format|
      if @gallo.save
        format.html { redirect_to gallo_path(@gallo), notice: "Gallo creado exitosamente." }
        format.json { 
          render json: { 
                   status: 'success', 
                   message: "Gallo creado exitosamente.", 
                   gallo: @gallo 
                 }, status: :created 
        }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { 
          render json: { 
                   status: 'error', 
                   errors: @gallo.errors.full_messages 
                 }, status: :unprocessable_entity 
        }
      end
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
    params.require(:gallo).permit(:placa, :weight_pounds, :weight_ounces, :genero, :apodo)
  end
end
