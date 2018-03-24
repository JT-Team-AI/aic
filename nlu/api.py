from lib.app_init import is_production

import sys
import traceback

# from logging import getLogger
from flask import Flask
from flask import jsonify
from flask import request

from lib.model import IntentClassifier
from lib.tokenizer import KuromojiTokenizer


"""
Sample json request data:
{
    "text": "input text here",
    "language": "en"
}

Sample request:
curl -i -H "Content-Type: application/json" -X POST -d '{"title": "kyoto", "description": "osaka", "language": "en", "threshold": "0.5"}' http://localhost:5000/infer

For Windows:
curl -i -H "Content-Type: application/json" -X POST -d "{\"title\": \"kyoto\", \"description\": \"osaka\", \"language\": \"en\", \"threshold\": \"0.5\"}" http://localhost:5500/infer

"""

app = Flask(__name__)


@app.route('/data/search', methods=['POST'])
def search():
    return jsonify({ 'results': [{
        'title': 'dummy title',
        'description': 'dummy description'
        }] })

@app.route('/intent', methods=['POST'])
def get_intent():
    try:
        json_ = request.get_json()
        query = json_["text"]
        language = json_["language"]

        if language == "en":
            prediction = en_model.infer([query])

        elif language == "ja":
            prediction = ja_model.infer([query])

        return jsonify(prediction)

    except Exception as e:
        return 'Error' if is_production else jsonify(
            {'error': str(e), 'trace': traceback.format_exc()}
            )


try:
    port = int(sys.argv[1])
except Exception as e:
    port = 5000

try:
    ja_model = IntentClassifier(tokenizer=KuromojiTokenizer().tokenize)
    ja_model.load_model("models/en_intent_model.pkl")
    app.logger.info('Model loaded: models/ja_intent_model.pkl')
    en_model = IntentClassifier(tokenizer=None)
    en_model.load_model("models/en_intent_model.pkl")
    app.logger.info('Model loaded: models/en_intent_model.pkl')


except Exception as e:
    app.logger.error(e)
    sys.exit(0)

# app.run(host='0.0.0.0', port=port, debug=True)
