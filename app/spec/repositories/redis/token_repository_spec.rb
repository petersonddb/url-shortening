require "rails_helper"

RSpec.describe Redis::TokenRepository do
  describe "#store" do
    subject(:store) { repository.store(token) }

    let(:client) { double("Redis client") }
    let(:repository) { described_class.new(client:) }
    let(:token) { "ABC_12" }

    context "when the token is new" do
      before do
        allow(client).to receive(:sadd).with("token_repository:available", token).and_return(true)
      end

      it "stores the token in the namespaced set and reports success" do
        stored = store

        expect(stored).to be(true)
        expect(client).to have_received(:sadd).with("token_repository:available", token)
      end
    end

    context "when the token already exists" do
      before do
        allow(client).to receive(:sadd).with("token_repository:available", token).and_return(false)
      end

      it "reports an existing token without storing a duplicate" do
        stored = store

        expect(stored).to be(false)
        expect(client).to have_received(:sadd).with("token_repository:available", token)
      end
    end
  end
end
