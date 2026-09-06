# frozen_string_literal: true

RSpec.shared_examples "locale resolution" do
  context "when Accept-Language prefers pt-BR" do
    let(:headers) { { "Accept-Language" => "pt-BR" } }

    it "renders Portuguese" do
      make_request

      expect(response.body).to match(/encurtador/i)
    end
  end

  context "when Accept-Language is absent" do
    let(:headers) { {} }

    it "renders default" do
      make_request

      expect(response.body).to match(/shorter/i)
    end
  end

  context "when Accept-Language has no supported language" do
    let(:headers) { { "Accept-Language" => "fr, de;q=0.8" } }

    it "renders default" do
      make_request

      expect(response.body).to match(/shorter/i)
    end
  end
end

