import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_threshold_alert(item_name: str, price: float, threshold: float, buy_link: str, recipient: str | None = None):
    sender = os.getenv("EMAIL_SENDER")
    password = os.getenv("EMAIL_PASSWORD")
    recipient = recipient or os.getenv("EMAIL_RECIPIENT")

    if not all([sender, password, recipient]):
        print("Email config missing — skipping alert")
        return

    subject = f"Price Alert: {item_name or 'Item'} dropped to ${price:.2f}"
    body = (
        f"Good news! The price for <b>{item_name or 'your tracked item'}</b> "
        f"has dropped to <b>${price:.2f}</b>, which is at or below your threshold of ${threshold:.2f}.<br><br>"
        f'<a href="{buy_link}">Buy now</a>'
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = recipient
    msg.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, password)
            server.sendmail(sender, recipient, msg.as_string())
        print(f"Alert sent for {item_name} at ${price:.2f}")
    except Exception as e:
        print(f"Failed to send email alert: {e}")
