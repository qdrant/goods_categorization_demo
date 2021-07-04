from goods_categorizer.config import DATA_DIR
import os
import numpy as np
import json
from sentence_transformers import SentenceTransformer


class Vectorizer:
    def __init__(self):
        self.model: SentenceTransformer = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2', device='cpu')


if __name__ == '__main__':
    data_path = os.path.join(DATA_DIR, 'good_items.json')
    vectors_path = os.path.join(DATA_DIR, 'vectors.npy')
    data = json.load(open(data_path))

    item_names = [record['item'] for record in data]

    vectorizer = Vectorizer()
    vectors = vectorizer.model.encode(item_names, show_progress_bar=True)
    print(vectors.shape)

    np.save(open(vectors_path, 'wb'), vectors)

