require "rails_helper"

RSpec.describe Short, type: :model do
  subject(:short) { Short.new }

  it { should validate_presence_of(:token) }
  it { should validate_presence_of(:original_url) }
  it { should validate_presence_of(:expire_at) }
  it { should validate_length_of(:token).is_equal_to(6) }
end
