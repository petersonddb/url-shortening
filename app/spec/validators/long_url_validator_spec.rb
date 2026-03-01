require "rails_helper"

RSpec.describe LongUrlValidator, type: :model do
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

  subject(:model) { model_class.new }

  describe "validations" do
    subject(:make_validate) { model.validate }

    context "given a possibly long url" do
      %w[ https://example.com/long-path
          http://example/path
          https://www.example.com/path
          //example.com/long-path ].each do |candidate_url|
        it "should NOT contain errors for #{candidate_url}" do
          model.url = candidate_url
          make_validate

          expect(model.errors).to be_empty
        end
      end
    end

    context "given NOT possibly long url" do
      [ "prot://example.com", # no path
        "example.com/long-path", # no scheme, no host
        "www.example.com/long-path", # no scheme, no host
        "/example/long-path" # no scheme, no host
      ].each do |candidate_url|
        it "should contain errors for #{candidate_url}" do
          model.url = candidate_url
          make_validate

          expect(model.errors).to include(:url)
        end
      end
    end
  end
end
