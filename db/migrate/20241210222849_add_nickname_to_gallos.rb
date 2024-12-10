class AddNicknameToGallos < ActiveRecord::Migration[8.0]
  def change
    add_column :gallos, :apodo, :string, null: true
  end
end
