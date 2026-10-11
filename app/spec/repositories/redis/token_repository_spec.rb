require "rails_helper"

RSpec.describe Redis::TokenRepository do
  describe "#store" do
    subject(:store) { repository.store(token) }

    let(:client) { double("Redis client") }
    let(:repository) { described_class.new(client:) }
    let(:token) { "ABC_12" }

    context "when the token is new" do
      let(:transaction) { double("Redis transaction") }

      before do
        allow(client).to receive(:watch).with("token_repository:unavailable") { |_key, &block| block.call }
        allow(client).to receive(:sismember).with("token_repository:unavailable", token).and_return(false)
        allow(client).to receive(:multi) { |&block| block.call(transaction); [ 1 ] }
        allow(transaction).to receive(:sadd).with("token_repository:available", token)
      end

      it "stores the token in the available set and reports success" do
        stored = store

        expect(stored).to be(true)
        expect(transaction).to have_received(:sadd).with("token_repository:available", token)
      end
    end

    context "when the token is unavailable" do
      before do
        allow(client).to receive(:watch).with("token_repository:unavailable") { |_key, &block| block.call }
        allow(client).to receive(:sismember).with("token_repository:unavailable", token).and_return(true)
        allow(client).to receive(:unwatch)
        allow(client).to receive(:multi)
      end

      it "does not make the token available again" do
        stored = store

        expect(stored).to be(false)
        expect(client).to have_received(:unwatch)
        expect(client).not_to have_received(:multi)
      end
    end

    context "when the token is already available" do
      let(:transaction) { double("Redis transaction", sadd: nil) }

      before do
        allow(client).to receive(:watch).with("token_repository:unavailable") { |_key, &block| block.call }
        allow(client).to receive(:sismember).with("token_repository:unavailable", token).and_return(false)
        allow(client).to receive(:multi) { |&block| block.call(transaction); [ 0 ] }
      end

      it "reports a collision" do
        stored = store

        expect(stored).to be(false)
      end
    end

    context "when the unavailable set changes during storage" do
      let(:transaction) { double("Redis transaction", sadd: nil) }

      before do
        allow(client).to receive(:watch).with("token_repository:unavailable") { |_key, &block| block.call }
        allow(client).to receive(:sismember).with("token_repository:unavailable", token).and_return(false, true)
        allow(client).to receive(:multi) { |&block| block.call(transaction); nil }
        allow(client).to receive(:unwatch)
      end

      it "rechecks the unavailable set after a transaction conflict" do
        stored = store

        expect(stored).to be(false)
        expect(client).to have_received(:sismember).twice
        expect(client).to have_received(:multi).once
      end
    end
  end

  describe "#allocate" do
    subject(:allocate) { repository.allocate }

    let(:client) { double("Redis client") }
    let(:repository) { described_class.new(client:) }

    context "when a token is available" do
      before do
        allow(client).to receive(:srandmember).with("token_repository:available").and_return("ABC_12")
        allow(client).to receive(:smove).with(
          "token_repository:available", "token_repository:unavailable", "ABC_12"
        ).and_return(true)
      end

      it "moves the token atomically and returns it" do
        token = allocate

        expect(token).to eq("ABC_12")
        expect(client).to have_received(:smove).with(
          "token_repository:available", "token_repository:unavailable", "ABC_12"
        )
      end
    end

    context "when another process moves the selected token first" do
      before do
        allow(client).to receive(:srandmember).with("token_repository:available").and_return("ABC_12", "DEF_34")
        allow(client).to receive(:smove).with(
          "token_repository:available", "token_repository:unavailable", "ABC_12"
        ).and_return(false)
        allow(client).to receive(:smove).with(
          "token_repository:available", "token_repository:unavailable", "DEF_34"
        ).and_return(true)
      end

      it "retries with another available token" do
        token = allocate

        expect(token).to eq("DEF_34")
        expect(client).to have_received(:srandmember).twice
      end
    end

    context "when no token is available" do
      before do
        allow(client).to receive(:srandmember).with("token_repository:available").and_return(nil)
      end

      it "returns nil" do
        token = allocate

        expect(token).to be_nil
      end
    end
  end
end
