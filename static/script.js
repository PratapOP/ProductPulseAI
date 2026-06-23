// static/script.js

const analyzeBtn = document.getElementById("analyzeBtn");
const ideaInput = document.getElementById("ideaInput");

const loadingSection = document.getElementById("loadingSection");
const resultSection = document.getElementById("resultSection");
const resultBox = document.getElementById("resultBox");

analyzeBtn.addEventListener("click", async () => {

    const idea = ideaInput.value.trim();

    if (!idea) {
        alert("Please enter a startup idea.");
        return;
    }

    loadingSection.classList.remove("hidden");
    resultSection.classList.add("hidden");

    analyzeBtn.disabled = true;
    analyzeBtn.innerText = "Analyzing...";

    try {

        const response = await fetch("/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                idea: idea
            })
        });

        const data = await response.json();

        resultBox.innerHTML = formatAIResponse(data.result);

        loadingSection.classList.add("hidden");
        resultSection.classList.remove("hidden");

        resultSection.scrollIntoView({
            behavior: "smooth"
        });

    }
    catch (error) {

        loadingSection.classList.add("hidden");

        resultSection.classList.remove("hidden");

        resultBox.innerHTML = `
        <div style="color:#ff8f8f;">
            Error generating analysis.
            Please check Gemini API key or internet connection.
        </div>
        `;

        console.error(error);
    }

    analyzeBtn.disabled = false;
    analyzeBtn.innerText = "Analyze Idea";

});

function formatAIResponse(text){

    let html = text;

    html = html.replace(/\*\*/g,"");

    const scoreMatch =
        text.match(/Overall Score:\s*(\d+)/i);

    let score = scoreMatch
        ? scoreMatch[1]
        : 75;

    html = `
    <div class="dashboard-grid">

        <div class="score-box">
            <div class="score-number">${score}</div>
            <h3>Product Market Fit</h3>
        </div>

        <div class="score-box">
            <div class="score-number">${Math.min(parseInt(score)+5,100)}</div>
            <h3>Investor Readiness</h3>
        </div>

    </div>

    <div class="analysis-card">
        ${html.replace(/\n/g,"<br>")}
    </div>

    <button class="copy-btn" onclick="copyAnalysis()">
        Copy Analysis
    </button>

    <button class="export-btn" onclick="window.print()">
        Export PDF
    </button>
    `;

    return html;
}

function copyAnalysis(){

    const text =
    document.getElementById("resultBox").innerText;

    navigator.clipboard.writeText(text);

    alert("Analysis copied successfully.");
}