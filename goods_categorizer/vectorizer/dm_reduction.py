import json
import os
import pickle

import pandas as pd
import numpy as np

import umap
from sklearn import preprocessing

from goods_categorizer.config import DATA_DIR


class DmReduction:

    def __init__(self, load_from=None):
        if load_from and os.path.exists(load_from):
            self.mapper = pickle.load(open(load_from, 'rb'))
        else:
            self.mapper = umap.UMAP(
                n_neighbors=5,
                n_components=2,
                metric="cosine",
                output_metric="euclidean",
                repulsion_strength=1.0
            )

    def save(self, path):
        pickle.dump(self.mapper, open(path, 'wb'))


if __name__ == '__main__':
    data_path = os.path.join(DATA_DIR, 'good_items.json')
    vectors_path = os.path.join(DATA_DIR, 'vectors.npy')
    cat_vectors_path = os.path.join(DATA_DIR, 'cat_vectors.npy')
    cat_vectors_2d_path = os.path.join(DATA_DIR, 'cat_vectors_2d.npy')
    mapper_path = os.path.join(DATA_DIR, 'mapper.pkl')

    graph_path = os.path.join(DATA_DIR, 'graph.json')

    avg_meta_path = os.path.join(DATA_DIR, 'categories_meta.tsv')
    cat_meta = pd.read_csv(avg_meta_path, sep='\t')

    category_labels = preprocessing.LabelEncoder().fit_transform(cat_meta.top_category.to_list())

    pd.read_json(data_path)

    vectors = np.load(open(vectors_path, 'rb'))

    cat_vectors = np.load(open(cat_vectors_path, 'rb'))

    reduction = DmReduction()

    reduction.mapper.fit(cat_vectors, y=category_labels)

    vectors_2d = reduction.mapper.transform(cat_vectors)
    cat_vectors_2d = reduction.mapper.transform(cat_vectors)

    reduction.save(mapper_path)

    np.save(open(cat_vectors_2d_path, 'wb'), cat_vectors_2d)

    print(cat_vectors_2d.shape)
    for item, vec in zip(cat_meta.category, cat_vectors_2d):
        print(vec, item)

    graph_data = [
        {**cat_data._asdict(), "vec": vec.tolist()}
        for cat_data, vec in zip(cat_meta.itertuples(), cat_vectors_2d)
    ]

    json.dump(graph_data, open(graph_path, 'w'), indent=2, ensure_ascii=False)
