from fastapi import APIRouter
import requests
from bs4 import BeautifulSoup # type: ignore
import validators # type: ignore

scraperouter = APIRouter(
    prefix="/scrape",
    tags=["scrape"],
    responses={404: {"description": "Not found"}},
)

@scraperouter.get("/")
async def scrape_url(url: str):
    print(url)
    if validators.url(url):
        response = requests.get(url)
        soup = BeautifulSoup(response.text, "html.parser")
        return response.text