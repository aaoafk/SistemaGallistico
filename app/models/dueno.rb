class Dueno < ApplicationRecord
  #############################################################################
  #                                Associations                               #
  #############################################################################
  has_many :historial_duenos
  has_many :gallos, through: :historial_duenos

  #############################################################################
  #                                Validations                                #
  #############################################################################
  validates :nombre, presence: true
  validates :apellido, presence: true

  def nombre_completo
    "#{nombre} #{apellido}"
  end
end
