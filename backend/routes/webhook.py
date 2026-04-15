"""
Router: /webhook

Handles:
  GET  /webhook  → WhatsApp webhook verification challenge
  POST /webhook  → Incoming WhatsApp messages (chatbot logic)
"""

from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from utils.whatsapp import send_whatsapp_message
from services.chatbot import handle_message

router = APIRouter(tags=["WhatsApp Webhook"])


# ── GET /webhook  ─  Meta verification handshake ──────────────────────────────
@router.get("/webhook")
async def verify_webhook(request: Request):
    """
    WhatsApp sends a GET request with hub.verify_token and hub.challenge
    when you first configure the webhook URL.  We echo back hub.challenge
    to prove ownership of the endpoint.
    """
    params = request.query_params
    mode = params.get("hub.mode")
    verify_token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if mode == "subscribe" and verify_token == "Hello_world":
        print("[Webhook] Verified successfully ✅")
        return int(challenge)

    print("[Webhook] Verification failed ❌")
    raise HTTPException(status_code=403, detail="Webhook verification failed")


# ── POST /webhook  ─  Incoming WhatsApp messages ──────────────────────────────
@router.post("/webhook")
async def whatsapp_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Receives incoming WhatsApp messages from Meta's servers, runs the
    grievance chatbot logic, and sends a reply back to the user.
    """
    print("[Webhook] Incoming request:", request)
    try:
        body = await request.json()
        
        print("[Webhook] Incoming payload:", body)

        # Only process whatsapp_business_account events
        if body.get("object") != "whatsapp_business_account":
            return {"status": "ignored"}

        for entry in body.get("entry", []):
            for change in entry.get("changes", []):

                # Only handle message-field changes
                if change.get("field") != "messages":
                    continue

                value = change.get("value", {})
                messages = value.get("messages")

                if not messages:
                    continue  # Could be a delivery receipt / status update

                for message in messages:
                    msg_type = message.get("type")

                    # ── Only handle plain text messages ───────────────────
                    if msg_type != "text":
                        from_number = message.get("from", "")
                        send_whatsapp_message(
                            from_number,
                            "Sorry, I can only process text messages right now. "
                            "Please type your grievance as text. 🙏",
                        )
                        continue

                    from_number: str = message.get("from", "")
                    text: str = message.get("text", {}).get("body", "").strip()

                    if not from_number or not text:
                        print("[Webhook] Skipping message — missing from or text")
                        continue

                    print(f"[Webhook] Message from {from_number}: {text!r}")

                    # ── Run chatbot logic ─────────────────────────────────
                    reply = handle_message(phone=from_number, text=text, db=db)

                    # ── Send reply via WhatsApp (None = silently drop) ────
                    if reply is None:
                        print(f"[Webhook] Rate-limited (silent drop) for {from_number}")
                        continue

                    result = send_whatsapp_message(to=from_number, message=reply)
                    print(f"[Webhook] Reply sent to {from_number}: {result}")

        return {"status": "ok"}

    except Exception as e:
        print(f"[Webhook] Unhandled error: {e}")
        return {"status": "error", "detail": str(e)}
