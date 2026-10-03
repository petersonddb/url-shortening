require "sidekiq/cron"

redis_url = ENV.fetch("REDIS_URL") do
  Rails.env.test? ? "redis://localhost:6379/15" : "redis://localhost:6379/0"
end

Sidekiq.configure_client do |config|
  config.redis = { url: redis_url }
end

Sidekiq.configure_server do |config|
  config.redis = { url: redis_url }
end

Sidekiq::Cron.configure do |config|
  config.cron_poll_interval = 1
  config.cron_schedule_file = Rails.root.join("config/sidekiq_schedule.yml").to_s
end
