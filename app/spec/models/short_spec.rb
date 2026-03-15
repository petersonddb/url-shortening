require "rails_helper"

RSpec.describe Short, type: :model do
  subject(:short) { Short.new }

  it { should validate_presence_of(:token) }
  it { should validate_presence_of(:original_url) }
  it { should validate_presence_of(:expire_at) }
  it { should validate_length_of(:token).is_equal_to(6) }

  context "with a possibly long original url" do
    before { short.original_url = "https://example.com/long-path" }

    it "should NOT fail the url validation" do
      short.validate

      expect(short.errors[:original_url]).to be_empty
    end
  end

  context "with a NOT possibly long original url" do
    before { short.original_url = "https://example.com" }

    it "should fail the url validation" do
      short.validate

      expect(short.errors).to include(:original_url)
    end
  end
end
