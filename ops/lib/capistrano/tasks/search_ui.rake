# frozen_string_literal: true

namespace :search_ui do
    task :build do on roles(:app) do |h|
        execute "cd #{release_path}/search-ui && npm install"
    end
    end
end
