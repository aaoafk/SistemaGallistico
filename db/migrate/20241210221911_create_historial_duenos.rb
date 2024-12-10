class CreateHistorialDuenos < ActiveRecord::Migration[8.0]
  def change
    create_table :historial_duenos do |t|
      t.references :gallo, null: false, foreign_key: true
      t.references :dueno, null: false, foreign_key: true
      t.datetime :fecha_inicio
      t.datetime :fecha_fin
      t.boolean :activo

      t.timestamps
    end
  end
end
