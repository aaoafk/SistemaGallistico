class Gallo < ApplicationRecord
  #############################################################################
  #                                 Attributes                                 #
  #############################################################################
  attr_accessor :weight_pounds, :weight_ounces

  enum :genero, gallo: 0, gallina: 1

  #############################################################################
  #                                Associations                                #
  #############################################################################
  belongs_to :user
  has_many :practicas, dependent: :destroy
  has_many :historial_duenos, dependent: :destroy
  has_many :duenos, through: :historial_duenos


  #############################################################################
  #                                Validations                                #
  #############################################################################
  validates :placa, presence: true
  validates :peso, presence: true
  validates :genero, presence: true
  before_validation :convert_weight_to_grams

  #############################################################################
  #                    Ransack is used to search the model                    #
  #############################################################################
  def self.ransackable_attributes(auth_object = nil)
    [ "apodo", "placa" ]
  end

  def self.ransackable_associations(auth_object = nil)
    [ "duenos", "historial_duenos", "practicas", "user" ]
  end
  after_find :set_weight_parts
  after_initialize :set_weight_parts

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
  def convert_weight_to_grams
    return unless weight_pounds.present? || weight_ounces.present?

    # Convert string inputs to integers, defaulting to 0 if blank
    pounds = weight_pounds.to_i
    ounces = weight_ounces.to_i

    # Convert to grams (1 pound = 453.592 grams, 1 ounce = 28.3495 grams)
    self.peso = (pounds * 453.592 + ounces * 28.3495).round
  end

  def set_weight_parts
    return unless peso

    # Convert grams to total ounces
    total_ounces = (peso / 28.3495).round

    # Split into pounds and remaining ounces
    self.weight_pounds = total_ounces / 16
    self.weight_ounces = total_ounces % 16
  end

  private
  ransacker :placa do
    Arel.sql("cast(#{table_name}.placa as CHAR)")
  end
end
