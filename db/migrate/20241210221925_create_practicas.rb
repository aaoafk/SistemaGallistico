class CreatePracticas < ActiveRecord::Migration[8.0]
  def change
    create_table :practicas do |t|
      t.datetime :fecha
      t.datetime :duracion
      t.references :gallo, null: false, foreign_key: true

      t.timestamps
    end
  end
end
