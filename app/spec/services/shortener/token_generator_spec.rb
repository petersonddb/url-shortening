require "rails_helper"

RSpec.describe Shortener::TokenGenerator do
  describe "#generate" do
    subject(:generate) { described_class.new(repository:).generate }

    let(:repository) { instance_double(Shortener::Redis::TokenRepository) }

    before do
      allow(SecureRandom).to receive(:random_bytes).with(6).and_return("\xFF\xFF\xFF\xFF\xFF\xFF".b)
    end

    context "when the repository stores the token" do
      before do
        allow(repository).to receive(:store).and_return(true)
      end

      it "stores a six-character URL-safe token generated from six random bytes" do
        token = generate

        expect(token).to eq("______")
        expect(token).to match(/\A[A-Za-z0-9_-]{6}\z/)
        expect(repository).to have_received(:store).with("______")
      end
    end

    context "when the repository already contains the token" do
      before do
        allow(repository).to receive(:store).with("______").and_return(false)
        allow(Rails.logger).to receive(:warn)
      end

      it "logs a collision" do
        token = generate

        expect(token).to be_nil
        expect(Rails.logger).to have_received(:warn).with(/collision/i)
        expect(repository).to have_received(:store).with("______")
      end
    end
  end
end
