class CreateGalloTaxonomias < ActiveRecord::Migration[8.0]
  def change
    create_table :gallo_taxonomias do |t|
      t.references :gallo, null: true, foreign_key: true, index: { unique: true }
      t.references :padre, null: true, foreign_key: { to_table: :gallos }
      t.references :madre, null: true, foreign_key: { to_table: :gallos }

      t.timestamps
    end
  end
end
