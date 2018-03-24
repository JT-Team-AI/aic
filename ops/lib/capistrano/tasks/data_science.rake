# frozen_string_literal: true

namespace :data_science do
    task :bundle do on roles(:app) do |h|
        execute "source #{release_path}/venv_data-science/bin/activate && pip install -r #{release_path}/#{fetch(:api_dir)}/requirements.txt"
    end
    end
end
