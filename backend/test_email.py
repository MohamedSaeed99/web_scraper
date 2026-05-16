from dotenv import load_dotenv
load_dotenv()

from services.email_service import send_threshold_alert

send_threshold_alert(
    item_name="Test Product",
    price=29.99,
    threshold=35.00,
    buy_link="https://example.com/product",
    recipient="moesaeed2014.ms@gmail.com"
)

print("Done — check your inbox.")
