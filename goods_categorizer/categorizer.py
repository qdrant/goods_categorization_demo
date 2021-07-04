import os
from collections import defaultdict
from pprint import pprint

from qdrant_client import QdrantClient

from goods_categorizer.config import DATA_DIR, QDRANT_HOST, QDRANT_PORT, COLLECTION_NAME
from goods_categorizer.vectorizer.dm_reduction import DmReduction
from goods_categorizer.vectorizer.vectorizer import Vectorizer


MAPPER_PATH = os.path.join(DATA_DIR, 'mapper.pkl')


class GoodsCategorizer:
    def __init__(self):
        self.vectorizer = Vectorizer()
        self.mapper = DmReduction(MAPPER_PATH)
        self.qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

    def categorize(self, good: str):
        vector = self.vectorizer.model.encode(good, show_progress_bar=False)
        result = self.qdrant_client.search(COLLECTION_NAME, query_vector=vector.tolist(), top=5, append_payload=True)
        categories = defaultdict(float)
        for hit, payload in result:
            categories[(payload['top_category'], payload['category'])] += hit.score

        return {
            "categories": sorted(categories.items(), key=lambda x: x[1], reverse=True),
        }

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

