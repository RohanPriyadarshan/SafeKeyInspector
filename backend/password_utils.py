import re
import math
import hashlib
import requests

def calculate_entropy(password):
    pool = 0
    if re.search(r"[a-z]", password): pool += 26
    if re.search(r"[A-Z]", password): pool += 26
    if re.search(r"[0-9]", password): pool += 10
    if re.search(r"[^a-zA-Z0-9]", password): pool += 32

    entropy = len(password) * math.log2(pool) if pool > 0 else 0
    return round(entropy, 2)

def evaluate_strength(password):
    entropy = calculate_entropy(password)

    checks = {
        "length": len(password) >= 8,
        "uppercase": bool(re.search(r"[A-Z]", password)),
        "numbers": bool(re.search(r"[0-9]", password)),
        "special": bool(re.search(r"[^a-zA-Z0-9]", password)),
        "common_patterns": not re.search(r"(123|password|qwerty|abc|111)", password.lower()),
    }

    score = sum(checks.values())

    if entropy < 28: level = "Very Weak"
    elif entropy < 36: level = "Weak"
    elif entropy < 60: level = "Moderate"
    elif entropy < 80: level = "Strong"
    else: level = "Very Strong"

    return {
        "entropy": entropy,
        "score": score,
        "level": level,
        "checks": checks,
    }

def breach_lookup(password):
    sha1 = hashlib.sha1(password.encode()).hexdigest().upper()
    prefix = sha1[:5]
    suffix = sha1[5:]

    url = f"https://api.pwnedpasswords.com/range/{prefix}"
    response = requests.get(url)

    if response.status_code != 200:
        return {"error": "Breach API unavailable"}

    hashes = response.text.splitlines()

    for h in hashes:
        h_suffix, count = h.split(":")
        if h_suffix == suffix:
            return {"breached": True, "count": int(count)}

    return {"breached": False, "count": 0}
