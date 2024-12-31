# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2024_12_31_145943) do
  create_table "duenos", force: :cascade do |t|
    t.string "nombre"
    t.string "apellido"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "gallo_taxonomias", force: :cascade do |t|
    t.integer "gallo_id"
    t.integer "padre_id"
    t.integer "madre_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["gallo_id"], name: "index_gallo_taxonomias_on_gallo_id", unique: true
    t.index ["madre_id"], name: "index_gallo_taxonomias_on_madre_id"
    t.index ["padre_id"], name: "index_gallo_taxonomias_on_padre_id"
  end

  create_table "gallos", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "placa"
    t.integer "peso"
    t.integer "genero"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "apodo"
    t.index ["user_id"], name: "index_gallos_on_user_id"
  end

  create_table "historial_duenos", force: :cascade do |t|
    t.integer "gallo_id", null: false
    t.integer "dueno_id", null: false
    t.datetime "fecha_inicio"
    t.datetime "fecha_fin"
    t.boolean "activo"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["dueno_id"], name: "index_historial_duenos_on_dueno_id"
    t.index ["gallo_id"], name: "index_historial_duenos_on_gallo_id"
  end

  create_table "practicas", force: :cascade do |t|
    t.datetime "fecha"
    t.integer "duracion"
    t.integer "gallo_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["gallo_id"], name: "index_practicas_on_gallo_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "correo"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "password_digest"
  end

  add_foreign_key "gallo_taxonomias", "gallos"
  add_foreign_key "gallo_taxonomias", "gallos", column: "madre_id"
  add_foreign_key "gallo_taxonomias", "gallos", column: "padre_id"
  add_foreign_key "gallos", "users"
  add_foreign_key "historial_duenos", "duenos"
  add_foreign_key "historial_duenos", "gallos"
  add_foreign_key "practicas", "gallos"
end
