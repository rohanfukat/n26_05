"""
Utility: send_whatsapp_message()
Wraps the Meta Graph API call to send a text reply to a WhatsApp number.
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

PHONE_NUMBER_ID: str = os.getenv("PHONE_NUMBER_ID", "")
ACCESS_TOKEN: str = os.getenv("ACCESS_TOKEN", "")

GRAPH_API_URL = f"https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages"


def send_whatsapp_message(to: str, message: str) -> dict:
    """
    Send a plain-text WhatsApp message via Meta Graph API.

    Args:
        to:      Recipient phone number in E.164 format (e.g. "919876543210").
        message: Text body to send.

    Returns:
        Parsed JSON response from the Graph API.
    """
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "text": {"body": message},
    }

    try:
        response = requests.post(GRAPH_API_URL, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"[WhatsApp] Failed to send message to {to}: {e}")
        return {"error": str(e)}
