# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
# db/seeds.rb

# First, let's create a test user who will own these roosters
user = User.create!(
  correo: 'criador@example.com',
  password: 'password'
)

# Let's create 20 roosters with varying characteristics
20.times do
  # Create a rooster with a 50% chance of having a nickname
  Gallo.create!(
    user: user,
    banda_de_ala: rand(1000..9999),  # 4-digit band number
    peso: rand(1800..2500),          # Weight in grams
    genero: [ :gallo, :gallina ].sample,
    apodo: [ Faker::FunnyName.name, nil ].sample  # 50% chance of having a nickname
  )
end

# Let's create some owners
5.times do
  Dueno.create!(
    nombre: Faker::Name.first_name,
    apellido: Faker::Name.last_name
  )
end

# Assign some owners to roosters through ownership history
Gallo.all.sample(10).each do |gallo|
  HistorialDueno.create!(
    gallo: gallo,
    dueno: Dueno.all.sample,
    fecha_inicio: Faker::Date.backward(days: 365),
    activo: true
  )
end

# After creating gallos and owners, let's add practice sessions
# We'll only create practices for some of the roosters to simulate reality

# Select 12 random roosters (60% of total) to have practice sessions
active_gallos = Gallo.all.sample(12)

active_gallos.each do |gallo|
  practice_count = rand(3..8)
  starting_date = 3.months.ago

  practice_count.times do |i|
    practice_date = starting_date + (i * rand(3..10)).days

    # Duration will now be stored in seconds
    # Converting our 15-45 minute range to seconds
    practice_duration = rand(15..45) * 60  # multiply by 60 to convert minutes to seconds

    Practica.create!(
      gallo: gallo,
      fecha: practice_date,
      duracion: practice_duration,
      created_at: practice_date,
      updated_at: practice_date
    )
  end
end
