import json
import os
import numpy as np

from qdrant_client import QdrantClient
from qdrant_openapi_client.models.models import Distance

from goods_categorizer.config import QDRANT_HOST, QDRANT_PORT, DATA_DIR, COLLECTION_NAME

BATCH_SIZE = 128

if __name__ == '__main__':
    qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

    vectors_path = os.path.join(DATA_DIR, 'vectors.npy')
    vectors = np.load(vectors_path)
    vector_size = vectors.shape[1]

    payload_path = os.path.join(DATA_DIR, 'good_items_en.json')
    payload = json.load(open(payload_path))

    qdrant_client.recreate_collection(collection_name=COLLECTION_NAME, vector_size=vector_size, distance=Distance.COSINE)

    qdrant_client.upload_collection(
        collection_name=COLLECTION_NAME,
        vectors=vectors,
        payload=payload,
        ids=None,
        batch_size=BATCH_SIZE,
        parallel=2
    )
