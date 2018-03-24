# frozen_string_literal: true

namespace :gunicorn do
  task :environment do
    set :gunicorn_pid, "#{shared_path}/tmp/gunicorn.pid"
  end

  def start_unicorn
      execute "cd #{release_path}/#{fetch(:api_dir)} && source ../venv_data-science/bin/activate &&" \
        " gunicorn" \
        " --bind=unix:#{shared_path}/tmp/gunicorn.sock" \
        " --pid=#{fetch(:gunicorn_pid)}" \
        " --log-file=#{shared_path}/log/gunicorn.log" \
        " --backlog=2048" \
        " --workers=4" \
        " --worker-class=sync" \
        " --worker-connections=1000" \
        " --max-requests=0" \
        " --timeout=300" \
        " --keep-alive=3" \
        " --log-level=info" \
        " --daemon" \
        " api:app"
  end

  def stop_unicorn
    execute :kill, "-TERM $(< #{fetch(:gunicorn_pid)})"
    execute "rm #{fetch(:gunicorn_pid)}"
  end

  def reload_unicorn
    execute :kill, "-HUP $(< #{fetch(:gunicorn_pid)})"
  end

  desc "Start unicorn server"
  task :start => :environment do
    on roles(:app) do
      start_unicorn
    end
  end

  desc "Restart gunicorn server gracefully"
  task :restart => :environment do
    on roles(:app) do
      if test("[ -f #{fetch(:gunicorn_pid)} ]")
        reload_unicorn
      else
        start_unicorn
      end
    end
  end

  desc "Stop unicorn server gracefully"
  task :stop => :environment do
    on roles(:app) do
      stop_unicorn
    end
  end
end
