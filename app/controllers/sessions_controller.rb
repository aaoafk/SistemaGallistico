class SessionsController < ApplicationController
  def new
    if current_user
      redirect_to gallos_path
    end
  end

  def create
    @user = User.find_by(correo: user_params[:correo])
  
    if @user&.authenticate(user_params[:password])
      sign_in(@user)
      redirect_to gallos_path, notice: "Sesión iniciada exitosamente!"
    else
      flash.now[:alert] = "Correo o contraseña inválidos"
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    sign_out
    redirect_to login_path, notice: "Te desconectaste. Nos vemos la próxima vez!"
  end

  private

  def user_params
    params.require(:user).permit(:correo, :password)
  end
  def sign_in(user)
    session[:user_id] = user.id
  end

  def sign_out
    session.delete(:user_id)
  end
end
