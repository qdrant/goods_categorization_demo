import os
from collections import defaultdict
from functools import lru_cache
from pprint import pprint
import numpy as np

from qdrant_client import QdrantClient

from goods_categorizer.config import DATA_DIR, QDRANT_HOST, QDRANT_PORT, COLLECTION_NAME
from goods_categorizer.vectorizer.dm_reduction import DmReduction
from goods_categorizer.vectorizer.vectorizer import Vectorizer


MAPPER_PATH = os.path.join(DATA_DIR, 'mapper.pkl')


def softmax(x):
    return np.exp(x) / sum(np.exp(x))


class GoodsCategorizer:
    def __init__(self):
        self.vectorizer = Vectorizer()
        self.mapper = DmReduction(MAPPER_PATH)
        self.qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

    def categorize(self, good: str):
        vector = self.vectorizer.model.encode(good, show_progress_bar=False)
        result = self.qdrant_client.search(COLLECTION_NAME, query_vector=vector.tolist(), top=3, append_payload=True)
        # Keep the closest example per category rather than summing the hits.
        # Summing made the number unbounded: two example products from the same
        # category inside the top 3 added together and the UI showed a "score"
        # above 1, which cannot be a cosine similarity. It also rewarded a
        # category for appearing twice over one that matched better once.
        categories = defaultdict(float)
        for hit, payload in result:
            cat = (payload['top_category'], payload['category'])
            categories[cat] = max(categories[cat], hit.score)

        categories = sorted(categories.items(), key=lambda x: x[1], reverse=True)

        categories = [
            {
                "category": cat,
                "top_category": top_cat,
                "score": score
            }
            for (top_cat, cat), score in categories
        ]

        return {
            "categories": categories,
        }

    @lru_cache(1000)
    def embed(self, good: str):
        vector = self.vectorizer.model.encode(good, show_progress_bar=False)
        return {
            "embedding": self.mapper.mapper.transform([vector])[0].tolist()
        }


if __name__ == '__main__':
    categorizer = GoodsCategorizer()
    print("loaded")
    res = categorizer.categorize("Система охлаждения CPU")
    pprint(res)
    res = categorizer.categorize("набор тарелок")
    pprint(res)

