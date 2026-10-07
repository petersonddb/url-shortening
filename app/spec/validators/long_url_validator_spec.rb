require "rails_helper"

RSpec.describe LongUrlValidator, type: :model do
  describe "#validate" do
    subject(:validate) { model.validate }

    let(:model_class) do
      Class.new do
        include ActiveModel::Validations

        attr_accessor :url
        validates :url, long_url: true

        def self.model_name
          ActiveModel::Name.new(self, nil, "mock_model_class")
        end
      end
    end
    let(:model) { model_class.new }

    [
      "https://example.com/long-path",
      "http://example/path",
      "https://www.example.com/path",
      "//example.com/long-path"
    ].each do |candidate_url|
      context "given a possibly long url #{candidate_url}" do
        before { model.url = candidate_url }

        it "does not contain errors" do
          validate

          expect(model.errors).to be_empty
        end
      end
    end

    [
      "prot://example.com", # no path
      "example.com/long-path", # no scheme, no host
      "www.example.com/long-path", # no scheme, no host
      "/example/long-path" # no scheme, no host
    ].each do |candidate_url|
      context "given NOT a possibly long url #{candidate_url}" do
        before { model.url = candidate_url }

        it "contains errors" do
          validate

          expect(model.errors).to include(:url)
        end
      end
    end
  end
end
