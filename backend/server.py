from flask import Flask, request, jsonify
from flask_cors import CORS
from password_utils import evaluate_strength, breach_lookup

app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    password = data.get("password", "")

    strength = evaluate_strength(password)
    breach = breach_lookup(password)

    return jsonify({
        "password_strength": strength,
        "breach_data": breach
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)
