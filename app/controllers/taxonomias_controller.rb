class TaxonomiasController < ApplicationController
  # Common setup actions for individual record operations
  before_action :set_taxonomia, only: [ :show, :edit, :update, :destroy ]

  # Optional: Add authentication if needed
  # before_action :authenticate_user!

  # GET /taxonomias
  def index
    # Fetch all taxonomias with eager loading to prevent N+1 queries
    @taxonomias = GalloTaxonomia.includes(:gallo, :padre, :madre)
  end

  # GET /taxonomias/:id
  def show
    # The before_action already sets @taxonomia
    # Potentially include additional related data retrieval
  end

  # GET /taxonomias/new
  def new
    # Initialize a new taxonomy instance
    @taxonomia = GalloTaxonomia.new
  end

  # POST /taxonomias
  def create
    @taxonomia = GalloTaxonomia.new(taxonomia_params)

    if @taxonomia.save
      redirect_to taxonomia_path(@taxonomia), notice: "Taxonomía creada exitosamente."
    else
      render :new, status: :unprocessable_entity
    end
  end

  # GET /taxonomias/:id/edit
  def edit
    # The before_action sets @taxonomia
  end

  # PATCH/PUT /taxonomias/:id
  def update
    if @taxonomia.update(taxonomia_params)
      redirect_to @taxonomia, notice: "Taxonomía actualizada exitosamente."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  # DELETE /taxonomias/:id
  def destroy
    @taxonomia.destroy
    redirect_to taxonomias_url, notice: "Taxonomía eliminada exitosamente."
  end

  private

  def set_taxonomia
    @taxonomia = GalloTaxonomia.find(params[:id])
  end

  # Strong parameters to prevent mass assignment vulnerabilities
  def taxonomia_params
    params.require(:gallo_taxonomia).permit(:gallo_id, :padre_id, :madre_id)
  end
end
