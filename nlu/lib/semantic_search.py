class SemanticSearch(object):
    
    # TODO: receive new set of search criteria from browser on every call of update_search_criteria instead of using stored value
    
    """
    sample_nlu_input = {
        'text': "sample text",
        'intent': {
            'intent',
            'score'
        },
        'entities': [
            {
                'name': None,
                'start': None,
                'end': None,
                'type': None
            }
        ]
    }

    """
    
    def __init__(self):
        self.default_criteria = {
            'filter': {
                'tags': None, # ["outdoor", "healing"]
                'words': None, # ["tokyo", "food"]
                'category': None, # "activity"
                'budget_more': None, # 10000 (currency)
                'budget_less': None, # 20000 (currency)
                'location': {
                    'lat': None, # 44.54 
                    'lng': None # 44.33
                },
                'distance': None # 2000 (meter)
            },
            'page': {
                'limit': None, # 20
                'offset': None # 0
            },
            'currency': None, # 'JPY'
            'langs': None, # ['en']
            'locale': None, # 'en'
            'sort': None # 'recommended'
        }
        
        # current_criteria should initialize with default_criteria and change with every call to update_search_criteria
        self.current_criteria = self.default_criteria
    
    def update_search_criteria(self, nlu_data):
        text = nlu_data['text']
        intents = nlu_data['intent']
        entities = nlu_data['entities']
        
        search_criteria = self.current_criteria
        
        # Modify search_criteria based
        # ...
        
        self.current_criteria = search_criteria
        return search_criteria