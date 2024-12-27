class RenameBandaDeAlaToPlaca < ActiveRecord::Migration[8.0]
  def change
    rename_column :gallos, :banda_de_ala, :placa
  end
end
