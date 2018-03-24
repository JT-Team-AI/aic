# Imports
from logging import getLogger
from sklearn import metrics
from sklearn import neural_network

import json
import numpy as np
import pandas as pd
import pickle as pkl

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MultiLabelBinarizer

logger = getLogger(__name__)


class IntentClassifier(object):

    def __init__(self, tokenizer=None):

        # Set tokenizer
        self.tokenizer = tokenizer

    def load_data(self, path="dataset.json"):

        # Get data
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        self.documents = [i['title'] + "\n" + i['description'] for i in data]
        self.labels = [i['tags'] for i in data]

        # Set label binarizer
        self.label_binarizer = MultiLabelBinarizer()
        self.label_binarizer.fit(self.labels)
        self.classes = self.label_binarizer.classes_

    def train(self, max_iter=200):

        self.count_vectorizer = CountVectorizer(tokenizer=self.tokenizer)
        self.count_vectorizer.fit(self.documents)
        counts = self.count_vectorizer.transform(self.documents)
        self.vocabulary = self.count_vectorizer.vocabulary_

        self.tfidf_transformer = TfidfTransformer()
        self.tfidf_transformer.fit(counts)

        logger.info("Training Supervised model")

        self.X = self.tfidf_transformer.transform(counts)
        self.y = self.label_binarizer.transform(self.labels)

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

    def save_classification_report(self, report, path="./reports/report.csv"):
        report_data = []
        lines = report.split('\n')
        for line in lines[2:-3]:
            row = {}
            row_data = line.lstrip().split('      ')
            row['class'] = row_data[0]
            row['precision'] = float(row_data[1])
            row['recall'] = float(row_data[2])
            row['f1_score'] = float(row_data[3])
            row['support'] = float(row_data[4])
            report_data.append(row)
        dataframe = pd.DataFrame.from_dict(report_data)
        dataframe.to_csv(path, index=False)

    def evaluate(self, test_size=0.2, max_iter=200, report_path="./reports/report.csv", threshold=0.5):

        self.test_vectorizer = TfidfVectorizer(tokenizer=self.tokenizer)
        self.test_model = neural_network.MLPClassifier(max_iter=max_iter)

        logger.info("Generating train test split with %f/%f ratio", 1-test_size, test_size)

        # Train test split
        self.doc_train, self.doc_test, self.label_train, self.label_test = train_test_split(self.documents,
                                                                                            self.labels,
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
        self.probs = self.test_model.predict_proba(self.X_test)
        self.predicted = (self.probs > threshold).astype(int)
#       self.predicted = self.test_model.predict(self.X_test)

        self.report = metrics.classification_report(self.y_test, self.predicted, target_names=self.classes)
        self.save_classification_report(self.report, path=report_path)
        logger.info("Classification Report saved to: %s", report_path)

        self.f1_score_micro = metrics.f1_score(self.y_test, self.predicted, average="micro")
        self.f1_score_weighted = metrics.f1_score(self.y_test, self.predicted, average="weighted")

        logger.info("F-1 Score (micro): %f", self.f1_score_micro)
        logger.info("F-1 Score (weighted): %f", self.f1_score_weighted)

    def infer(self, query, threshold=0.5):
        query_counts = self.count_vectorizer.transform(query)
        query_x = self.tfidf_transformer.transform(query_counts)
        prob = self.model.predict_proba(query_x)[0]
        pred = (prob > threshold).astype(int)
        res = self.classes[np.where(pred)]
        return res
