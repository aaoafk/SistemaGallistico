# Be sure to restart your server when you modify this file.

# Add new inflection rules using the following format. Inflections
# are locale specific, and you may define rules for as many different
# locales as you wish. All of these examples are active by default:
# ActiveSupport::Inflector.inflections(:en) do |inflect|
#   inflect.plural /^(ox)$/i, "\\1en"
#   inflect.singular /^(ox)en/i, "\\1"
#   inflect.irregular "person", "people"
#   inflect.uncountable %w( fish sheep )
# end

# These inflection rules are supported but not enabled by default:
# ActiveSupport::Inflector.inflections(:en) do |inflect|
#   inflect.acronym "RESTful"
# end
# config/initializers/inflections.rb

# ActiveSupport::Inflector rules help Rails understand how to convert between
# singular and plural forms of words. This is crucial for model names and database tables.
ActiveSupport::Inflector.inflections(:en) do |inflect|
  # Tell Rails that "taxonomia" becomes "taxonomias" in plural
  inflect.irregular 'taxonomia', 'taxonomias'
  
  # If you have more Spanish words that need custom rules, add them here:
  # inflect.irregular 'gallo', 'gallos'  # Though this one works by default!
end
