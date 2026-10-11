require "rails_helper"

RSpec.describe "Shorts Pages", type: :request do
  describe "GET /shorts" do
    subject(:make_request) { get("/shorts", headers: headers) }

    it_behaves_like("locale resolution")

    context "when shorts exist" do
      let(:headers) { {} }
      let(:repository) { instance_double(Redis::TokenRepository) }

      before do
        allow(repository).to receive(:allocate).and_return("ABC123", "DEF456")
        Shorts::CreateForm.new(original_url: "https://test.example.com/long", repository:).save
        Shorts::CreateForm.new(original_url: "https://test.example.com/very-long", repository:).save
      end

      it "lists existent shorts" do
        make_request

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to match(/html/i)
        expect(response.body).to include(
          "https://test.example.com/long",
          "https://test.example.com/very-long"
        )
      end
    end
  end

  describe "POST /shorts" do
    subject(:make_request) { post("/shorts", params: params) }

    context "with valid params" do
      let(:params) { { short: { original_url: "https://test.example.com/new-long" } } }
      let(:repository) { instance_double(Redis::TokenRepository, allocate: "ABC123") }

      before do
        allow(Redis::TokenRepository).to receive(:new).and_return(repository)
      end

      it "indicates the new short has been created" do
        make_request

        expect(response).to redirect_to(shorts_path)
        follow_redirect!

        expect(response.content_type).to match(/html/i)
        expect(response.body).to include("https://test.example.com/new-long")
        expect(response.body).to include("ABC123")
      end
    end

    context "when no token is available" do
      let(:params) { { short: { original_url: "https://test.example.com/new-long" } } }
      let(:repository) { instance_double(Redis::TokenRepository, allocate: nil) }

      before do
        allow(Redis::TokenRepository).to receive(:new).and_return(repository)
        allow(Rails.logger).to receive(:error)
      end

      it "logs and reraises the shortage without creating a short" do
        expect { make_request }.to raise_error(Shorts::CreateForm::TokenUnavailable, /no token/i)

        expect(Rails.logger).to have_received(:error).with(/no token/i)

        get("/shorts")

        expect(response).to have_http_status(:ok)
        expect(response.body).not_to include("https://test.example.com/new-long")
      end
    end

    context "with no original url" do
      let(:params) { { short: { original_url: nil } } }

      it "indicates validation errors" do
        make_request

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.content_type).to match(/html/i)
        expect(response.body).to include("original URL is required")
      end
    end

    context "with an invalid original url" do
      let(:params) { { short: { original_url: "invalid-url" } } }

      it "indicates validation errors" do
        make_request

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.content_type).to match(/html/i)
        expect(response.body).to include("original URL is invalid")
      end
    end
  end
end
