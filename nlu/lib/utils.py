import json
from lib import tinysegmenter
from logging import getLogger
import re
import requests

logger = getLogger(__name__)


# Simple Japanese Language Tokenizer based on TinySegmenter

def preprocess(data_path, tags_path, output_path, language_id, max_df_ratio=0.8, min_occurence=10):
    # Add stdout

    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    with open(tags_path, 'r', encoding='utf-8') as f:
        tags = json.load(f)

    # Filter items by description language
    language_filtered = [item for item in data if item['description'][0]['language_id'] == language_id]

    n_docs = len(language_filtered)

    # Extract theme and place ids
    theme_ids = {tag['id']: tag['attributes']['label'] for tag in tags if tag['attributes']['taggableType'] == 'Theme'}
    # place_ids = { tag['id']: tag['attributes']['label'] for tag in tags if tag['attributes']['taggableType']=='Place'}
    # theme_names = [i for k, i in theme_ids.items()]

    # Filter tags with counts above or below threshold
    all_tags = [item['tag_ids'] for item in language_filtered]
    theme_tags = [[x for x in l if str(x) in theme_ids.keys()] for l in all_tags]
    tag_keys = list(theme_ids.keys())
    tag_occurences = [sum([int(key) in theme_tag for theme_tag in theme_tags]) for key in theme_ids.keys()]
    above_max_count = [tag_keys[idx] for idx, tag_occurence in enumerate(tag_occurences) if tag_occurence/n_docs > max_df_ratio]
    below_max_count = [tag_keys[idx] for idx, tag_occurence in enumerate(tag_occurences) if tag_occurence < min_occurence]
    filter_keys = set(above_max_count).union(set(below_max_count))
    filtered_theme_tags = [[x for x in l if str(x) not in filter_keys] for l in theme_tags]

    # Get ids of documents without any assigned tags
    empty_docs = [idx for idx, doc in enumerate(filtered_theme_tags) if not doc]

    # Filter out final list of documents and tags
    final_docs = [i for idx, i in enumerate(language_filtered) if idx not in empty_docs]
    final_tags = [i for idx, i in enumerate(filtered_theme_tags) if idx not in empty_docs]
    final_tag_names = [[theme_ids[str(x)] for x in l] for l in final_tags]

    # Generate output dict for dataset
    dataset = []
    for idx, doc in enumerate(final_docs):
        dataset.append({
            'title': doc['title'][0]['label'],
            'description': doc['description'][0]['label'],
            'tags': final_tag_names[idx]
        })

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, indent=4, ensure_ascii=False)
