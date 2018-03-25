import pdb
import re
import copy

def find_numbers(string, ints=True):
    numexp = re.compile(r'[-]?\d[\d,]*[\.]?[\d{2}]*') #optional - in front
    numbers = numexp.findall(string)    
    numbers = [x.replace(',','') for x in numbers]
    if ints is True:
        return [int(x.replace(',','').split('.')[0]) for x in numbers]
    else:
        return numbers

LOCATION = {
  'Shinjuku': { 'lat': 35.7015, 'lng': 139.6741 },
  'Osaka': { 'lat': 34.6937, 'lng': 135.5022 },
  'Tokyo Tower': { 'lat': 35.6586, 'lng': 139.7454 },
  'Sky Tree': { 'lat': 35.7101, 'lng': 139.8107 }
}

LANGUAGE = {
'English': 'en',
'Japanese': 'ja',
'japan': 'ja'
}

def get_entity(entities, type):
   entity = [x for x in entities if x['type']==type]
   return entity[0] if len(entity) > 0 else None

class SemanticSearch(object):
    
    # TODO: receive new set of search criteria from browser on every call of update_search_criteria instead of using stored value
    
    """
    default_nlu_input = {
        'text': "sample text",
        'language': "en",
        'intent': {
            'top_intent',
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
        self.current_criteria = copy.deepcopy(self.default_criteria)
    
    def update_search_criteria(self, nlu_data):
        text = nlu_data['text']
        language = nlu_data['language']
        intent = nlu_data['intent']
        entities = nlu_data['entities']

        search_criteria = self.current_criteria

        intent_class = intent['top_intent']
        intent_score = intent['score']

        if intent_score < 0.3:
            return self.current_criteria

        if intent_class=="clear_search":
          pdb.set_trace()
          self.current_criteria = copy.deepcopy(self.default_criteria)
          return self.current_criteria

        money = get_entity(entities, 'MONEY')
        cardinal = get_entity(entities, 'CARDINAL')
        facility = get_entity(entities, 'FAC')
        location = get_entity(entities, 'GPE')
        natinality = get_entity(entities, 'NORP')
        language = get_entity(entities, 'LANGUAGE')

        if intent_class=="set_maximum_price" and money:
            search_criteria['filter']['budget_less'] = find_numbers(money['name'])[0]

        elif intent_class=="set_minimum_price" and money:
            search_criteria['filter']['budget_more'] = find_numbers(money['name'])[0]

        if intent_class=="set_location":
            loc = location and LOCATION.get(location['name'], None)
            if loc:
                search_criteria['filter']['location'] = loc
            else:
                search_criteria['filter']['words'] = [facility['name'] or location['name']]

            if cardinal:
                search_criteria['filter']['distance'] = find_numbers(cardinal['name'])[0]
            else:
                search_criteria['filter']['distance'] = 10000

        if intent_class=="find_creative":
            search_criteria['filter']['tags'] = ['Art Galleries']

        if intent_class=="find_relaxing":
            search_criteria['filter']['tags'] = ['Hot springs / Spa']

        if intent_class=="find_cultural":
            search_criteria['filter']['tags'] = ['Tradition']

        if intent_class=="set_language":
            lang = (location and LANGUAGE[location['name']]) or (natinality and LANGUAGE[natinality['name']]) or (language and LANGUAGE[language['name']])
            if lang:
                search_criteria['langs'] = [lang]
                search_criteria['langs'] = [lang]

        self.current_criteria = search_criteria
        return search_criteria
