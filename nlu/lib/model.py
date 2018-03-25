# Imports
from logging import getLogger
from sklearn import metrics
from sklearn import neural_network
import spacy

from lib.utils import read_json

import json
import random
import numpy as np
import pandas as pd
import pickle as pkl

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelBinarizer

logger = getLogger(__name__)


class IntentClassifier(object):

    def __init__(self, tokenizer=None):

        # Set tokenizer
        self.tokenizer = tokenizer

    def load_data(self, path="dataset.json"):

        # Get data
        train_data = read_json(path)
        examples = train_data['rasa_nlu_data']['common_examples']
        self.texts = [x['text'] for x in examples]
        self.intents = [x['intent'] for x in examples]

        # Set label binarizer
        self.label_binarizer = LabelBinarizer()
        self.label_binarizer.fit(self.intents)
        self.classes = self.label_binarizer.classes_

    def train(self, max_iter=200):

        self.count_vectorizer = CountVectorizer(tokenizer=self.tokenizer)
        self.count_vectorizer.fit(self.texts)
        counts = self.count_vectorizer.transform(self.texts)
        self.vocabulary = self.count_vectorizer.vocabulary_

        self.tfidf_transformer = TfidfTransformer()
        self.tfidf_transformer.fit(counts)

        logger.info("Training Supervised model")

        self.X = self.tfidf_transformer.transform(counts)
        self.y = self.label_binarizer.transform(self.intents)

        self.model = neural_network.MLPClassifier(max_iter=max_iter)
        self.model.fit(self.X, self.y)
        logger.info("Training finished")

    def save_model(self, path="./models/model.pkl"):
        # Save model and vectorizer to pkl file
        with open(path, "wb") as f:
            pkl.dump([self.model, self.tfidf_transformer, self.vocabulary, self.classes], f)
        logger.info("Trained model saved to: %s", path)

    def load_model(self, path="./models/model.pkl"):
        # Load model and vectorizer from pkl file
        with open(path, "rb") as f:
            self.model, self.tfidf_transformer, self.vocabulary, self.classes = pkl.load(f)
        logger.info("Loaded pre-trained model from: %s", path)

        self.count_vectorizer = CountVectorizer(tokenizer=self.tokenizer,
                                                vocabulary=self.vocabulary)

    def evaluate(self, test_size=0.2, max_iter=200, threshold=0.5):

        self.test_vectorizer = TfidfVectorizer(tokenizer=self.tokenizer)
        self.test_model = neural_network.MLPClassifier(max_iter=max_iter)

        logger.info("Generating train test split with %f/%f ratio", 1-test_size, test_size)

        # Train test split
        self.doc_train, self.doc_test, self.label_train, self.label_test = train_test_split(self.texts,
                                                                                            self.intents,
                                                                                            test_size=test_size,
                                                                                            random_state=42)
        # Vectorize X
        self.test_vectorizer.fit(self.doc_train)
        self.X_train = self.test_vectorizer.transform(self.doc_train)
        self.X_test = self.test_vectorizer.transform(self.doc_test)

        # Vectorize y
        self.y_train = self.label_binarizer.transform(self.label_train)
        self.y_test = self.label_binarizer.transform(self.label_test)

        logger.info("Training Supervised model")
        self.test_model.fit(self.X_train, self.y_train)

        logger.info("Testing supervised model")
        self.predicted = self.test_model.predict(self.X_test)
#        self.predicted = self.classes[np.argmax(self.probs)]

        self.f1_score_micro = metrics.f1_score(self.y_test, self.predicted, average="micro")
        self.f1_score_weighted = metrics.f1_score(self.y_test, self.predicted, average="weighted")

        logger.info("F-1 Score (micro): %f", self.f1_score_micro)
        logger.info("F-1 Score (weighted): %f", self.f1_score_weighted)

    def infer(self, query):
        query_counts = self.count_vectorizer.transform(query)
        query_x = self.tfidf_transformer.transform(query_counts)
        prob = self.model.predict_proba(query_x)[0]
        pred = self.classes[np.argmax(prob)]
        score = prob[np.argmax(prob)]
        result =  {
            'top_intent': pred,
            'score': score
        }
        return result
    
class EntityExtractor(object):
    
    """
    to get model, run: python -m spacy download en_core_web_md
    """

    """
    PERSON        People, including fictional.
    NORP          Nationalities or religious or political groups.
    FACILITY      Buildings, airports, highways, bridges, etc.
    ORG           Companies, agencies, institutions, etc.
    GPE           Countries, cities, states.
    LOC           Non-GPE locations, mountain ranges, bodies of water.
    PRODUCT       Objects, vehicles, foods, etc. (Not services.)
    EVENT         Named hurricanes, battles, wars, sports events, etc.
    WORK_OF_ART   Titles of books, songs, etc.
    LAW           Named documents made into laws.
    LANGUAGE      Any named language.
    DATE          Absolute or relative dates or periods.
    TIME          Times smaller than a day.
    PERCENT       Percentage, including "%".
    MONEY         Monetary values, including unit.
    QUANTITY      Measurements, as of weight or distance.
    ORDINAL       "first", "second", etc.
    CARDINAL      Numerals that do not fall under another type.
    """
    
    def __init__(self, tokenizer=None):

        self.tokenizer = tokenizer
        
    def load_data(self, path="data/testData.json", language='en'):
        data = read_json(path)
        examples = data['rasa_nlu_data']['common_examples']
        self.texts = [x['text'] for x in examples]
        self.entities = [x['entities'] for x in examples]
        entities_ = [{'entities': [(i['start'], i['end'], i['entity']) for i in j]} for j in self.entities]
        self.train_data = list(zip(self.texts, entities_))
        self.language = language

    def train(self, n_iters=200):
        self.model = spacy.blank(self.language)
        logger.info("Training Entity Recognition Model")
        optimizer = self.model.begin_training()
        for i in range(n_iters):
            random.shuffle(self.train_data)
            for text, annotations in self.train_data:
                self.model.update([text], [annotations], sgd=optimizer)
        logger.info("Training finished")

    def save_model(self, path="models/en_entity_model"):
        self.model.to_disk(path)
        logger.info("Trained model saved to: %s", path)

    def load_model(self, path=None):
        if not path:
            self.model = spacy.load('en_core_web_md')
        else:
            self.model = spacy.load(path)
        logger.info("Loaded pre-trained model from: %s", path)
        
    def infer(self, query):
        doc = self.model(query)

        results = []
        for ent in doc.ents:
            result = {
                "name": str(ent.text),
                "start": str(ent.start_char),
                "end": str(ent.end_char),
                "type": str(ent.label_)
            }
            results.append(result)
        return results
