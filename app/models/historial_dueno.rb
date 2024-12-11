class HistorialDueno < ApplicationRecord
  #############################################################################
  #                                Associations                               #
  #############################################################################
  belongs_to :gallo
  belongs_to :dueno

  #############################################################################
  #                                Validations                                #
  #############################################################################
  validates :fecha_inicio, presence: true
  validates :activo, inclusion: { in: [ true, false ] }
  validate :only_one_active_owner_per_gallo

  private
  def only_one_active_owner_per_gallo
    if activo && gallo.historial_duenos.where(activo: true).where.not(id: id).exists?
      errors.add(:activo, "Este gallo ya tiene un dueño activo")
    end
  end
end
