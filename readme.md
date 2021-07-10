
# Consumer goods categorisation

![Demo](./demo.mov)


This demo uses product samples from real-life e-commerce categorization.
Each product name is encoded using a **neural text encoder model** and indexed into the Qdrant vector similarity search engine.
Once you submit a new product name, it will be encoded using the same neural network and compare against stored references.

The colored dots you see under the input box are category vectors used in this demo.
The vectors have been reduced to 2D using [Umap](https://umap-learn.readthedocs.io/) so that they could be rendered.
Reduced to 2D point vectors lose some information, so the relative distance on the plain is not always accurate.
Adding new categories to the system is equivalent to adding a new vector to the collection of examples.
It means that the list of categories can be expanded and refined **without retraining**.

## How to

Install

```bash
pip install poetry
poetry install

poetry shell  # Enable virtual environment for this project
```

Run Qdrant
```bash
docker run -v $(pwd)/data/storage:/qdrant/storage -p 6333:6333 generall/qdrant
```

Prepare data and vectors
```bash
# Prepare the data
python -m goods_categorizer.data_parser

# Build embeddings
python -m goods_categorizer.vectorizer.vectorizer

# Prepare embeddings for projector
python -m goods_categorizer.convert_to_projector

# Build dimension reduction model for visualisation
python -m goods_categorizer.vectorizer.dm_reduction

# Translate categories into english (original - Russian)
python -m goods_categorizer.translate_categories

# Upload data to Qdrant (should be launched on localhost:6333)
python -m goods_categorizer.upload_data
```

Run service:

```bash
uvicorn goods_categorizer.service:app --host 0.0.0.0 --port 8000 --workers 1
```

Run frontend:
```bash
cd frontend; npm install; npx quasar dev
```
