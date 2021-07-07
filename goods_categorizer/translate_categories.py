import json
import os

from goods_categorizer.config import DATA_DIR

if __name__ == '__main__':

    translation = {}

    with open(os.path.join(DATA_DIR, 'market_categories_translate_en.txt')) as en_cat_fd:
        with open(os.path.join(DATA_DIR, 'market_categories_translate_ru.txt')) as ru_cat_fd:

            for ru_line, en_line in zip(ru_cat_fd, en_cat_fd):

                en_top_cat, en_cat = en_line.split("/")
                ru_top_cat, ru_cat = ru_line.split("/")

                en_top_cat = en_top_cat.strip()
                en_cat = en_cat.strip().capitalize()
                ru_top_cat = ru_top_cat.strip()
                ru_cat = ru_cat.strip()

                translation[(ru_top_cat, ru_cat)] = (en_top_cat, en_cat)

    with open(os.path.join(DATA_DIR, 'graph.json')) as fd:
        graph = json.load(fd)

    for record in graph:
        en_top_cat, en_cat = translation[(record['top_category'], record['category'])]

        record['top_category'] = en_top_cat
        record['category'] = en_cat

    with open(os.path.join(DATA_DIR, 'graph_en.json'), 'w') as out:
        json.dump(graph, out, indent=2, ensure_ascii=False)

    with open(os.path.join(DATA_DIR, 'good_items.json')) as fd:
        good_items = json.load(fd)

    for record in good_items:
        en_top_cat, en_cat = translation[(record['top_category'], record['category'])]

        record['top_category'] = en_top_cat
        record['category'] = en_cat

    with open(os.path.join(DATA_DIR, 'good_items_en.json'), 'w') as out:
        json.dump(good_items, out, indent=2, ensure_ascii=False)
