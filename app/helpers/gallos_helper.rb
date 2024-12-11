module GallosHelper
  # Converts grams to a formatted string showing pounds and ounces
  # Example: 2500 grams -> "5 lbs 8 oz"
  def format_weight_in_lbs_oz(grams)
    return "N/A" if grams.nil?

    # First, convert grams to ounces (1 gram = 0.035274 ounces)
    total_ounces = (grams * 0.035274).round

    # Calculate pounds (1 pound = 16 ounces)
    pounds = total_ounces / 16

    # Calculate remaining ounces
    remaining_ounces = total_ounces % 16

    if pounds > 0
      # If we have both pounds and ounces
      if remaining_ounces > 0
        "#{pounds} #{'libra'.pluralize(pounds)} #{remaining_ounces} oz"
      else
        # Just pounds if it's an exact pound amount
        "#{pounds} #{'libra'.pluralize(pounds)}"
      end
    else
      # Just ounces if less than a pound
      "#{remaining_ounces} oz"
    end
  end
end
