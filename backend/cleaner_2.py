import re
import spacy

nlp = spacy.load("en_core_web_sm")

def clean_text(text: str) -> str:
    if not text:
        return ""

    text = text.lower()

    # Remove URLs
    text = re.sub(r"http\S+|www\S+", "", text)

    # Keep useful characters (numbers important for location)
    text = re.sub(r"[^a-z0-9\s\-]", " ", text)

    text = re.sub(r"\s+", " ", text).strip()

    doc = nlp(text)

    tokens = []

    for token in doc:
        # 🚫 DO NOT remove important negations
        if token.text in ["no", "not"]:
            tokens.append(token.text)
            continue

        # 🚫 DO NOT remove location-like tokens
        if token.like_num:
            tokens.append(token.text)
            continue

        # 🚫 Skip only useless tokens
        if token.is_stop or token.is_punct:
            continue

        # ⚠️ Avoid aggressive lemmatization for short tokens
        lemma = token.lemma_ if len(token.text) > 3 else token.text

        tokens.append(lemma)

    cleaned = " ".join(tokens)

    # fallback if too aggressive
    if len(cleaned.split()) < 2:
        return text.strip()

    return cleaned