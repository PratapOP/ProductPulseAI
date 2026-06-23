from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from groq import Groq
import os

load_dotenv()

app = Flask(__name__)

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

SYSTEM_PROMPT = """
You are ProductPulse AI.

You are:
- Senior Product Manager
- Startup Consultant
- Venture Capital Analyst

Analyze the startup idea and return your response in EXACTLY the following format.

STARTUP NAME SUGGESTIONS:
- Name 1
- Name 2
- Name 3
- Name 4
- Name 5

PRODUCT SUMMARY:
(3-5 concise bullet points)

PROBLEM STATEMENT:
(3 concise bullet points)

TARGET AUDIENCE:
(5 bullet points)

MARKET OPPORTUNITY:
(5 bullet points)

SWOT ANALYSIS:

Strengths:
- point
- point

Weaknesses:
- point
- point

Opportunities:
- point
- point

Threats:
- point
- point

PRODUCT MARKET FIT SCORE:
Overall Score: XX/100

Market Demand: XX/100
Competition Advantage: XX/100
Scalability: XX/100
Revenue Potential: XX/100
Execution Feasibility: XX/100

INVESTOR READINESS SCORE:
Overall Score: XX/100

Growth Potential: XX/100
Funding Attractiveness: XX/100
Risk Level: XX/100
Profitability Potential: XX/100

REVENUE MODEL:
(5 concise bullet points)

COMPETITOR ANALYSIS:

Competitor 1:
- Strength
- Weakness

Competitor 2:
- Strength
- Weakness

Competitor 3:
- Strength
- Weakness

RISK FACTORS:
(5 bullet points)

MVP ROADMAP:

Phase 1:
- point
- point

Phase 2:
- point
- point

Phase 3:
- point
- point

FINAL VERDICT:

- One paragraph
- Whether the idea should be built or not
- Mention biggest opportunity
- Mention biggest risk
"""


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():

    try:

        data = request.get_json()
        idea = data.get("idea")

        prompt = f"""
        {SYSTEM_PROMPT}

        Startup Idea:

        {idea}
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=4000
        )

        result = completion.choices[0].message.content

        return jsonify({
            "success": True,
            "result": result
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "result": str(e)
        }), 500


if __name__ == "__main__":
    app.run()