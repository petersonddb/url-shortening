# frozen_string_literal: true

require "rails_helper"

RSpec.describe Shorts::CreateService, type: :unit do
  subject(:create_short) { described_class.call(**params) }

  context 'with valid params' do
    let(:params) { { original_url: "https://example.com/long_path" } }

    it { expect { create_short }.to change(Short, :count).by(1) }

    it 'succeeds' do
      result = create_short

      expect(result).to be_success
      expect(result.record).to be_a Short
      expect(result.record.token).to eq("123456")
    end
  end

  context 'with NOT valid params' do
    let(:params) { { original_url: nil } }

    it { expect { create_short }.not_to change(Short, :count) }

    it 'fails' do
      result = create_short

      expect(result).not_to be_success
      expect(result.errors).to include(:validation)
      expect(result.errors[:validation]).to be_a Short
    end
  end
end
