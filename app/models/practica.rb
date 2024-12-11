class Practica < ApplicationRecord
  belongs_to :gallo
  # Validation to ensure duration is present and positive
  validates :duracion, presence: true, numericality: { greater_than: 0 }

  # Returns a formatted string representing the duration
  # Examples: "1 hour 30 minutes", "45 minutes", "90 seconds"
  def duracion_formateada
    # Use Rails' built-in time helpers to format the duration
    if duracion >= 3600 # 1 hour or more
      # Convert to hours and minutes
      hours = duracion / 3600
      remaining_minutes = (duracion % 3600) / 60

      if remaining_minutes > 0
        "#{hours} #{'hora'.pluralize(hours)} #{remaining_minutes} #{'minuto'.pluralize(remaining_minutes)}"
      else
        "#{hours} #{'hora'.pluralize(hours)}"
      end
    elsif duracion >= 60 # 1 minute or more
      minutes = duracion / 60
      "#{minutes} #{'minuto'.pluralize(minutes)}"
    else
      "#{duracion} #{'segundo'.pluralize(duracion)}"
    end
  end

  # Helper method to set duration using minutes
  # This makes it easier to create practices with minute-based durations
  def duracion_en_minutos=(minutes)
    self.duracion = minutes.to_i * 60
  end

  def duracion_en_minutos
    duracion ? duracion / 60 : nil
  end
end
