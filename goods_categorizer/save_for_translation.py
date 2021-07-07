import json
import os

from goods_categorizer.config import DATA_DIR

if __name__ == '__main__':

    graph = json.load(open(os.path.join(DATA_DIR, 'graph.json')))

    for point in graph:
        print(point['top_category'], '/', point['category'])
