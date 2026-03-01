# frozen_string_literal: true

# ApplicationService is an abstract base for the services
class ApplicationService
  Result = Struct.new(:success?, :record, :errors, keyword_init: true)

  def self.call(...)
    new(...).run
  end
end
