import lib.app_init

import sys
import traceback
import pdb
import json

from flask import Flask
from flask import jsonify
from flask import request

app = Flask(__name__)

@app.errorhandler(Exception)
def handle_exception(e):
    detail = { "error": str(e), "trace": traceback.format_exc() }
    app.logger.error(f"{str(e)}\n{detail['trace']}")
    return detail, 500

@app.route('/data/search', methods=['POST'])
def search():
    return jsonify({ 'results': [{
      'title': 'dummy title',
      'description': 'dummy description'
    }] })

try:
    port = int(sys.argv[1])
except Exception as e:
    port = 5000
