import logging.config
import os
import yaml

is_production = os.getenv('LIIGO_ENV', 'DEVELOPMENT') == 'production'
config = {}

def __init_logger():
    logging.config.dictConfig(config)
    if is_production:
       for name in ['elasticsearch', 'werkzeug', 'urllib3']:
           logging.getLogger(name).setLevel(logging.CRITICAL)

__initialized = False
if not __initialized:
    __initialized = True

    conf_default = yaml.load(open('config/config.yaml').read())
    conf_env = yaml.load(open('config/config_{}.yaml'.format('production' if is_production else 'development')).read())
    config = {**conf_default, **conf_env}
    __init_logger()
