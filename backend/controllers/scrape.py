import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI
import validators

app = FastAPI()

@app.get("/scrape")
async def scrape_url(url: str):
    if validators.url(url):
        response = requests.get(url)
        soup = BeautifulSoup(response.text, "html.parser")