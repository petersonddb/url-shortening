require "rails_helper"

RSpec.describe Shortener::TokenGenerationJob, type: :job do
  subject(:job) { described_class.new }

  describe "#perform" do
    subject(:perform) { job.perform }

    let(:generator) { instance_double(Shortener::TokenGenerator) }
    let(:repository) { instance_double(Shortener::Redis::TokenRepository) }

    before do
      allow(job).to receive(:repository).and_return(repository)
      allow(Shortener::TokenGenerator).to receive(:new).and_return(generator)
      allow(generator).to receive(:generate).and_return("ABC_12")
    end

    it "builds a generator with its repository and delegates token generation" do
      perform

      expect(Shortener::TokenGenerator).to have_received(:new).with(repository:)
      expect(generator).to have_received(:generate)
    end
  end
end
