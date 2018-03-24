# frozen_string_literal: true

server ENV.fetch('SERVER'),
  user: 'liigo-data-science',
  roles: %i[app],
  ssh_options: {
    forward_agent: true,
    auth_methods: %w[publickey],
  }
set :application, 'aic'
set :tmp_dir, '/tmp/aic'
set :repo_url, 'git@github.com:JT-Team-AI/aic.git'
set :deploy_via, :remote_cache
set :deploy_to, '/usr/local/liigo-data-science'
set :log_level, :debug
set :format, :airbrussh
set :format_options, command_output: true, log_file: 'log/capistrano.log', color: :auto, truncate: :auto
set :pty, true
append :linked_dirs, 'log', 'tmp', 'venv_data-science'
set :keep_releases, 5
set :keep_assets, 5

after 'deploy:updated', 'data_science:bundle'
after 'deploy:publishing', 'gunicorn:restart'
