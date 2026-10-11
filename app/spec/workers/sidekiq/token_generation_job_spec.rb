require "rails_helper"

RSpec.describe TokenGenerationJob, type: :job do
  subject(:job) { described_class.new }

  describe "#perform" do
    subject(:perform) { job.perform }

    let(:generator) { instance_double(Tokens::Generator) }
    let(:repository) { instance_double(Redis::TokenRepository) }

    before do
      allow(job).to receive(:repository).and_return(repository)
      allow(Tokens::Generator).to receive(:new).and_return(generator)
      allow(generator).to receive(:generate).and_return("ABC_12")
    end

    it "builds a generator with its repository and delegates token generation" do
      perform

      expect(Tokens::Generator).to have_received(:new).with(repository:)
      expect(generator).to have_received(:generate)
    end
  end
end
