from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from textblob import TextBlob
import re
from urllib.parse import urlparse

app = Flask(__name__)
# Enable CORS for all domains
CORS(app, resources={r"/*": {"origins": "*"}})

def check_credibility(text):
    # Basic credibility checks
    checks = []
    
    # Check for all caps (often indicates sensationalism)
    if text.isupper() and len(text.split()) > 3:
        checks.append("⚠️ Text is in all caps, which may indicate sensationalism")
    
    # Check for excessive punctuation
    if text.count('!') > 3 or text.count('?') > 3:
        checks.append("⚠️ Excessive punctuation may indicate emotional manipulation")
    
    # Check for common clickbait phrases
    clickbait_phrases = [
        "you won't believe", "shocking", "mind-blowing", "never before seen",
        "going viral", "breaking news", "exclusive", "secret"
    ]
    for phrase in clickbait_phrases:
        if phrase.lower() in text.lower():
            checks.append(f"⚠️ Contains clickbait phrase: '{phrase}'")
    
    return checks

def analyze_sentiment(text):
    # Basic sentiment analysis
    analysis = TextBlob(text)
    sentiment = analysis.sentiment.polarity
    
    if sentiment > 0.5:
        return "😊 Very positive"
    elif sentiment > 0:
        return "🙂 Positive"
    elif sentiment < -0.5:
        return "😠 Very negative"
    elif sentiment < 0:
        return "😕 Negative"
    else:
        return "😐 Neutral"

def extract_claims(text):
    # Extract potential factual claims
    claims = []
    sentences = text.split('.')
    
    # Look for sentences that might contain factual claims
    claim_indicators = [
        "is", "are", "was", "were", "has", "have", "will", "can", "must",
        "proves", "shows", "demonstrates", "confirms"
    ]
    
    for sentence in sentences:
        sentence = sentence.strip()
        if any(indicator in sentence.lower() for indicator in claim_indicators):
            if len(sentence.split()) > 3:  # Avoid very short sentences
                claims.append(sentence)
    
    return claims[:3]  # Return top 3 potential claims

def check_toxicity(text):
    # Basic toxicity detection
    toxic_words = [
        'hate', 'stupid', 'idiot', 'dumb', 'ugly', 'kill', 'die',
        'worthless', 'useless', 'terrible', 'awful', 'horrible'
    ]
    found_words = [word for word in toxic_words if word in text.lower()]
    return found_words

def check_emotional_manipulation(text):
    # Check for emotional manipulation tactics
    manipulation_indicators = {
        'urgency': ['now', 'immediately', 'urgent', 'emergency', 'last chance'],
        'fear': ['scary', 'dangerous', 'threat', 'warning', 'alert'],
        'guilt': ['should', 'must', 'have to', 'need to', 'obligation'],
        'exaggeration': ['never', 'always', 'everyone', 'no one', 'best ever']
    }
    
    found_indicators = {}
    for category, words in manipulation_indicators.items():
        found = [word for word in words if word in text.lower()]
        if found:
            found_indicators[category] = found
    
    return found_indicators

def check_source_credibility(url):
    # Basic source credibility check
    if not url:
        return "No source provided"
    
    domain = urlparse(url).netloc
    trusted_domains = [
        'reuters.com', 'apnews.com', 'bbc.com', 'nytimes.com',
        'washingtonpost.com', 'theguardian.com'
    ]
    
    if domain in trusted_domains:
        return "✅ Trusted source"
    else:
        return "⚠️ Unknown source"

def analyze_content(text):
    # Perform all checks
    toxicity = check_toxicity(text)
    manipulation = check_emotional_manipulation(text)
    sentiment = TextBlob(text).sentiment.polarity
    
    # Compile results
    results = {
        "toxicity": {
            "has_toxic_content": len(toxicity) > 0,
            "toxic_words": toxicity
        },
        "emotional_manipulation": {
            "has_manipulation": len(manipulation) > 0,
            "manipulation_types": manipulation
        },
        "sentiment": {
            "score": sentiment,
            "label": "Positive" if sentiment > 0 else "Negative" if sentiment < 0 else "Neutral"
        }
    }
    
    return results

@app.route('/analyze', methods=['POST', 'OPTIONS'])
def analyze():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    data = request.json
    text = data.get('text', '')
    source_url = data.get('source_url', '')
    
    # Get content analysis
    content_analysis = analyze_content(text)
    
    # Get source credibility if URL provided
    if source_url:
        content_analysis['source_credibility'] = check_source_credibility(source_url)
    
    response = jsonify(content_analysis)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == '__main__':
    app.run(port=5000) 