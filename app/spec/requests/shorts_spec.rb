require "rails_helper"

RSpec.describe "Shorts Pages", type: :request do
  describe "GET /shorts" do
    subject(:make_request) { get("/shorts") }

    before do
      Shorts::CreateForm.new(original_url: 'https://test.example.com/long').save
      Shorts::CreateForm.new(original_url: 'https://test.example.com/very-long').save
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

  describe "POST /shorts" do
    subject(:make_request) { post("/shorts", params: params) }

    context "with valid params" do
      let(:params) { { short: { original_url: "https://test.example.com/new-long" } } }

      it "indicates the new short has been created" do
        make_request

        expect(response).to redirect_to(shorts_path)
        follow_redirect!

        expect(response.content_type).to match(/html/i)
        expect(response.body).to include("https://test.example.com/new-long")
      end
    end

    context "with NOT valid params having NO original url" do
      let(:params) { { short: { original_url: nil } } }

      it "indicates validation errors" do
        make_request

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.content_type).to match(/html/i)
        expect(response.body).to include("Original url is required")
      end
    end

    context "with NOT valid params having invalid original url" do
      let(:params) { { short: { original_url: "invalid-url" } } }

      it "indicates validation errors" do
        make_request

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.content_type).to match(/html/i)
        expect(response.body).to include("Original url is invalid")
      end
    end
  end
end
