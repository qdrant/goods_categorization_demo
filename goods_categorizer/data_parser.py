import json
from typing import Dict, Iterable, List
from goods_categorizer.config import DATA_DIR
import os


class CategoryParser:
    def __init__(self) -> None:
        self.target_level = 2

    def parse_tree(self, path) -> dict:
        tree = {}
        with open(path, 'r') as fd:
            for line in fd:
                paths = line.strip().split('/')
                node = tree
                for path in paths:
                    if path not in node:
                        node[path] = {}
                    node = node[path]
        return tree

    def traverse_leafs(self, tree) -> Iterable[str]:
        for key, siblings in tree.items():
            if len(siblings) == 0:
                yield key
            else:
                yield from self.traverse_leafs(siblings)

    def traverse_tree(self, tree: dict, level=0) -> dict:
        res = {}
        for key, siblings in tree.items():
            if level == self.target_level:
                res[key] = list(self.traverse_leafs(siblings))
                if len(res[key]) == 0:
                    res[key] = [key]
            else:
                res[key] = self.traverse_tree(siblings, level=level + 1)

        return res

    def parse(self, path) -> Dict[str, List[str]]:
        tree = self.parse_tree(path)
        return self.traverse_tree(tree)


if __name__ == '__main__':
    categories_path = os.path.join(DATA_DIR, 'market_categories.txt')
    categories_json_path = os.path.join(DATA_DIR, 'categories.json')
    items_json_path = os.path.join(DATA_DIR, 'good_items.json')

    parser = CategoryParser()
    categories = parser.parse(categories_path)

    json.dump(categories['Все товары'], open(categories_json_path, 'w'), indent=2, ensure_ascii=False)

    categories: dict = categories['Все товары']

    good_items = []

    for top_level_category, subcategories in categories.items():
        for subcategory, items in subcategories.items():
            for item in items:
                good_items.append({
                    "item": item,
                    "category": subcategory,
                    "top_category": top_level_category
                })

    json.dump(good_items, open(items_json_path, 'w'), indent=2, ensure_ascii=False)
