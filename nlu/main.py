# from lib.utils import tinysegmenter_tokenize
import lib.app_init

from lib.model import IntentClassifier
from lib.model import EntityExtractor
from lib.tokenizer import KuromojiTokenizer
from logging import getLogger

import argparse
import json

logger = getLogger(__name__)

# Command line arguments
parser = argparse.ArgumentParser()

group = parser.add_mutually_exclusive_group()
group.add_argument("--train", action="store_true")
group.add_argument("--evaluate", action="store_true")
group.add_argument("--intent", action="store_true")
group.add_argument("--entity", action="store_true")

# Model arguments
parser.add_argument('--model_path', type=str, default="./models/en_intent_model.pkl", help='Output path for trained model')
parser.add_argument('--data_path', type=str, default="data/testData.json", help='Path to processed dataset for training')
parser.add_argument('--tokenizer', type=str, default="en", help='Language of training data, en or ja')
parser.add_argument('--split_ratio', type=float, default=0.8, help='Ratio of training data for evaluation')
parser.add_argument('--iterations', type=int, default=200, help='Maximum iterations for MLP training')
parser.add_argument('--query', type=str, default="", help='Text to infer tags from')
parser.add_argument("--query_type", type=str, default="TEXT", help='Set query format, TEXT or JSON')

args = parser.parse_args()

if args.tokenizer == "ja":
    tokenizer = KuromojiTokenizer().tokenize
elif args.tokenizer == "en":
    tokenizer = None

if args.train:
    intent_classifier = IntentClassifier(tokenizer=tokenizer)
    intent_classifier.load_data(path=args.data_path)
    intent_classifier.train(max_iter=args.iterations)
    intent_classifier.save_model(path=args.model_path)

elif args.evaluate:
    intent_classifier = IntentClassifier(tokenizer=tokenizer)
    intent_classifier.load_data(path=args.data_path)
    intent_classifier.evaluate(test_size=(1-args.split_ratio), max_iter=args.iterations)

elif args.intent:
    intent_classifier = IntentClassifier(tokenizer=tokenizer)
    intent_classifier.load_model(args.model_path)

    if args.query_type == "JSON":
        dictionary = json.loads(args.query)
        q = dictionary['text']
    else:
        q = args.query

    predictions = intent_classifier.infer([q])
    logger.info("Predicted intent: %s", predictions)

elif args.entity:
    entity_extractor = EntityExtractor()
    entity_extractor.load_model()

    if args.query_type == "JSON":
        dictionary = json.loads(args.query)
        q = dictionary['text']
    else:
        q = args.query

    predictions = entity_extractor.infer(q)
    logger.info("Extracted entities: %s", predictions)

else:
    logger.warn("No mode specified")
