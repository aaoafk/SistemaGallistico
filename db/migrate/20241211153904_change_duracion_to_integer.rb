class ChangeDuracionToInteger < ActiveRecord::Migration[8.0]
  def change
    change_column :practicas, :duracion, :integer
  end

end
