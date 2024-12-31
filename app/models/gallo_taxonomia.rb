class GalloTaxonomia < ApplicationRecord
  # Define our core relationships
  belongs_to :gallo
  belongs_to :padre, class_name: 'Gallo', optional: true
  belongs_to :madre, class_name: 'Gallo', optional: true

  # Validations to ensure data integrity
  validate :parents_must_be_different
  validate :parent_cannot_be_self
  validate :parents_must_be_appropriate_gender

  private

  def parents_must_be_different
    if padre_id.present? && madre_id.present? && padre_id == madre_id
      errors.add(:base, "Padre y madre no pueden ser el mismo gallo")
    end
  end

  def parent_cannot_be_self
    if [padre_id, madre_id].include?(gallo_id)
      errors.add(:base, "Un gallo no puede ser su propio padre o madre")
    end
  end

  def parents_must_be_appropriate_gender
    if padre.present? && padre.genero != 'gallo'
      errors.add(:padre, "debe ser un gallo")
    end
    if madre.present? && madre.genero != 'gallina'
      errors.add(:madre, "debe ser una gallina")
    end
  end
end
