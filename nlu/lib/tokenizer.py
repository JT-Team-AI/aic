from gensim.models.doc2vec import TaggedDocument
from elasticsearch import Elasticsearch
from lib.app_init import config
import glob
import re

class MecabTokenizer(object):
	def __init__(self):
		self.tagger = MeCab.Tagger()
		self.jp_filter = re.compile(r'[㐀-䶵一-鿋豈-頻]|[ぁ-んァ-ン]')

	def tokenize(self, sent):
	    
	    self.tagger.parse("")
	    graph = self.tagger.parseToNode(sent)
	    words = []
	    
	    while graph:
	        words.append(graph.surface)
	        graph = graph.next
	    filtered = [word for word in words if self.jp_filter.match(word)]
	    return filtered

class KuromojiTokenizer(object):
    #  def __init__(self):
        #        self.es = Elasticsearch([config['elasticsearch']['url']],
        #          verify_certs=False
        #        )

    def tokenize(self, text):
        params = {
            'analyzer': 'kuromoji',
            'text': text
        }
        r = self.es.indices.analyze(body=params)
        tokens = [token['token'] for token in r['tokens']]
        return tokens

    def pos_tokenize(self, text):
        params = {
            'analyzer': 'kuromoji',
            'text': text,
            'explain': True
        }
        r = self.es.indices.analyze(body=params)
        tokens = [token['token'] for token in r['detail']['analyzer']['tokens']]
        pos = [token['partOfSpeech'] for token in r['detail']['analyzer']['tokens']]
        return tokens, pos