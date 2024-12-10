class CreateGallos < ActiveRecord::Migration[8.0]
  def change
    create_table :gallos do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :banda_de_ala
      t.integer :peso
      t.integer :genero

      t.timestamps
    end
  end
end
