class CreateDuenos < ActiveRecord::Migration[8.0]
  def change
    create_table :duenos do |t|
      t.string :nombre
      t.string :apellido

      t.timestamps
    end
  end
end
