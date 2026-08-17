# frozen_string_literal: true

require "rails_helper"

RSpec.describe LocaleResolver do
  describe ".resolve" do
    subject(:resolved) { described_class.resolve(accept_language_header: header) }

    context "when the Accept-Language header is blank" do
      let(:header) { nil }

      it "returns the default locale" do
        expect(resolved).to eq("en")
      end
    end

    context "when the Accept-Language header is empty" do
      let(:header) { "" }

      it "returns the default locale" do
        expect(resolved).to eq("en")
      end
    end

    context "when the header has an exact available locale" do
      let(:header) { "pt-BR" }

      it "returns that locale" do
        expect(resolved).to eq("pt-BR")
      end
    end

    context "when the header has a language-only match" do
      let(:header) { "pt" }

      it "returns the matching regional locale" do
        expect(resolved).to eq("pt-BR")
      end
    end

    context "when the header uses underscore form" do
      let(:header) { "pt_BR" }

      it "normalizes and returns the available locale" do
        expect(resolved).to eq("pt-BR")
      end
    end

    context "when qualities rank an unsupported language first" do
      let(:header) { "fr;q=0.9, pt-BR;q=0.8" }

      it "returns the highest-quality available locale" do
        expect(resolved).to eq("pt-BR")
      end
    end

    context "when only unsupported languages are requested" do
      let(:header) { "fr, de;q=0.8" }

      it "returns the default locale" do
        expect(resolved).to eq("en")
      end
    end
  end
end
