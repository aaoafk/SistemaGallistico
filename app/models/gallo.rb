class Gallo < ApplicationRecord
  enum :genero, gallo: 0, gallina: 1

  #############################################################################
  #                                Associations                                #
  #############################################################################
  belongs_to :user
  has_many :practicas
  has_many :historial_duenos
  has_many :duenos, through: :historial_duenos
  has_many :practicas

  
  #############################################################################
  #                                Validations                                #
  #############################################################################
  validates :banda_de_ala, presence: true
  validates :peso, presence: true
  validates :genero, presence: true

  # Helper method to get current owner
  def dueno_actual
    historial_duenos.find_by(activo: true)&.dueno
  end

  # Method to change owners while maintaining history
  def cambiar_dueno(nuevo_dueno)
    # Start a transaction to ensure data consistency
    Gallo.transaction do
      # Find and end the current active ownership
      dueno_actual_record = historial_duenos.find_by(activo: true)
      if dueno_actual_record
        dueno_actual_record.update!(
          activo: false,
          fecha_fin: Time.current
        )
      end
      
      # Create new ownership record
      historial_duenos.create!(
        dueno: nuevo_dueno,
        fecha_inicio: Time.current,
        activo: true
      )
    end
  end
end
