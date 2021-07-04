import os
from collections import defaultdict

import numpy as np
import pandas as pd

from goods_categorizer.config import DATA_DIR

if __name__ == '__main__':
    data_path = os.path.join(DATA_DIR, 'good_items.json')
    vectors_path = os.path.join(DATA_DIR, 'vectors.npy')

    vectors_tsv_path = os.path.join(DATA_DIR, 'vectors.tsv')
    meta_path = os.path.join(DATA_DIR, 'good_items.tsv')

    cat_vectors_path = os.path.join(DATA_DIR, 'cat_vectors.npy')
    cat_vectors_tsv_path = os.path.join(DATA_DIR, 'cat_vectors.tsv')

    avg_meta_path = os.path.join(DATA_DIR, 'categories_meta.tsv')

    pd.read_json(data_path).to_csv(meta_path, index=None, sep='\t')

    vectors = np.load(open(vectors_path, 'rb'))

    print(vectors.shape)

    with open(vectors_tsv_path, 'w') as out:
        for vector in vectors:
            out.write("\t".join(map(str, vector)))
            out.write('\n')

    df = pd.read_json(data_path)

    category_to_ids = defaultdict(list)
    category_to_top_cat = {}

    for idx, row in enumerate(df.itertuples()):
        category_to_ids[row.category].append(idx)
        category_to_top_cat[row.category] = row.top_category

    avg_vectors = []
    avg_meta = []
    for cat, ids in category_to_ids.items():
        avg_vec = np.mean(vectors[ids], axis=0)
        avg_meta.append({
            "category": cat,
            "top_category": category_to_top_cat[cat]
        })
        avg_vectors.append(avg_vec)

    avg_vectors = np.stack(avg_vectors)
    print(avg_vectors.shape)

    np.save(open(cat_vectors_path, 'wb'), avg_vectors)

    pd.DataFrame(avg_meta).to_csv(avg_meta_path, index=False, sep='\t')

    with open(cat_vectors_tsv_path, 'w') as out:
        for vector in avg_vectors:
            out.write("\t".join(map(str, vector)))
            out.write('\n')
