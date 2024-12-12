class ApplicationController < ActionController::Base
  allow_browser versions: :modern
  before_action :authenticate_user!
  
  private
  
  def authenticate_user!
    return if controller_name == "sessions" # Skip auth check for sessions controller
    
    unless User.find_by(id: session[:user_id])
      redirect_to login_path, alert: "Por favor inicia sesión para continuar."
    end
  end

  # Helper method to get current user in views/controllers
  def current_user
    @current_user ||= User.find_by(id: session[:user_id])
  end
  helper_method :current_user
end
