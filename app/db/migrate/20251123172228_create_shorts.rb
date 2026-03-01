class CreateShorts < ActiveRecord::Migration[8.0]
  def change
    create_table :shorts do |t|
      t.string(:token, limit: 6, null: false)
      t.string(:original_url, null: false)
      t.date(:expire_at, null: false)

      t.timestamps
    end
  end
end
