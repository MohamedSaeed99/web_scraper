import os
import resend


def send_threshold_alert(item_name: str, price: float, threshold: float, buy_link: str, recipient: str | None = None):
    resend.api_key = os.getenv("RESEND_API_KEY")
    sender = os.getenv("EMAIL_SENDER")
    recipient = recipient or os.getenv("EMAIL_RECIPIENT")

    if not all([resend.api_key, sender, recipient]):
        print("Email config missing — skipping alert")
        return

    try:
        resend.Emails.send({
            "from": sender,
            "to": [recipient],
            "subject": f"Price Alert: {item_name or 'Item'} dropped to ${price:.2f}",
            "html": (
                f"Good news! The price for <b>{item_name or 'your tracked item'}</b> "
                f"has dropped to <b>${price:.2f}</b>, which is at or below your threshold of ${threshold:.2f}.<br><br>"
                f'<a href="{buy_link}">Buy now</a>'
            ),
        })
        print(f"Alert sent for {item_name} at ${price:.2f}")
    except Exception as e:
        print(f"Failed to send email alert: {e}")
