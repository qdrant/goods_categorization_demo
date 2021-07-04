from fastapi import FastAPI

from goods_categorizer.categorizer import GoodsCategorizer

app = FastAPI()

neural_searcher = GoodsCategorizer()


@app.get("/api/categorize")
async def read_item(q: str):
    return {
        "result": neural_searcher.categorize(good=q)
    }


@app.get("/api/embed")
async def read_item(q: str):
    return {
        "result": neural_searcher.embed(good=q)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
