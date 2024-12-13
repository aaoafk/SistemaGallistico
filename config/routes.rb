Rails.application.routes.draw do
  get "/login", to: "sessions#new", as: "login"
  post "/sessions", to: "sessions#create"
  get "/logout", to: "sessions#destroy", as: "logout"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "/service-worker.js" => "service_worker#service_worker"
  get "/manifest.json" => "service_worker#manifest"

  # Defines the root path route ("/")
  root "sessions#new"
  resources :gallos
  resources :practicas
end
