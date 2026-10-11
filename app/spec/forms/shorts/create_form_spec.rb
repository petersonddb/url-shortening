require "rails_helper"

RSpec.describe Shorts::CreateForm do
  describe "#save" do
    subject(:save) { form.save }

    let(:repository) { instance_double(Redis::TokenRepository) }
    let(:form) { described_class.new(original_url:, repository:) }

    context "with a valid URL and an available token" do
      let(:original_url) { "https://test.example.com/long" }

      before do
        allow(repository).to receive(:allocate).and_return("ABC123")
      end

      it "persists the short with the allocated token" do
        saved = save

        expect(saved).to be(true)
        expect(repository).to have_received(:allocate).once
        expect(Short.last.token).to eq("ABC123")
        expect(Short.last.expire_at).to eq(Time.zone.today + 1.year)
      end
    end

    context "with an invalid URL" do
      let(:original_url) { "invalid-url" }

      before do
        allow(repository).to receive(:allocate)
      end

      it "does not consume a token" do
        saved = save

        expect(saved).to be(false)
        expect(repository).not_to have_received(:allocate)
        expect(Short.count).to eq(0)
      end
    end

    context "when no token is available" do
      let(:original_url) { "https://test.example.com/long" }

      before do
        allow(repository).to receive(:allocate).and_return(nil)
      end

      it "raises an application error without saving" do
        expect { save }.to raise_error(described_class::TokenUnavailable, /no token/i)

        expect(form.errors).to be_empty
        expect(Short.count).to eq(0)
      end
    end
  end
end
