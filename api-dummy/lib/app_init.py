import logging.config
import os
import yaml

config = {}

def __init_logger():
    logging.config.dictConfig(config)

__initialized = False
if not __initialized:
    __initialized = True

    config = yaml.load(open('config/config.yaml').read())
    __init_logger()
