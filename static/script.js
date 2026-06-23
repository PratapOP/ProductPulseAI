// static/script.js

const analyzeBtn = document.getElementById("analyzeBtn");
const ideaInput  = document.getElementById("ideaInput");

const loadingSection = document.getElementById("loadingSection");
const resultSection  = document.getElementById("resultSection");
const resultBox      = document.getElementById("resultBox");

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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idea })
        });

        const data = await response.json();

        if (data.success) {
            renderDashboard(data.result);
            loadingSection.classList.add("hidden");
            resultSection.classList.remove("hidden");
            resultSection.scrollIntoView({ behavior: "smooth" });
        } else {
            throw new Error(data.result);
        }

    } catch (error) {
        loadingSection.classList.add("hidden");
        resultSection.classList.remove("hidden");
        resultBox.innerHTML = `
            <div class="widget" style="border-color: var(--red);">
                <h3 style="color: var(--red); margin-bottom:10px;">Analysis Error</h3>
                <p style="color: var(--text-muted);">${error.message}</p>
            </div>
        `;
    }

    analyzeBtn.disabled = false;
    analyzeBtn.innerText = "Analyze Idea";
});


/* ============================================
   DASHBOARD RENDERER
   Parses structured AI text into styled widgets
============================================ */
function renderDashboard(text) {

    text = text.replace(/\*\*/g, "");

    const extract = (title, next) => {
        const re = new RegExp(`${title}:?[\\s\\S]*?(?=${next || '$'})`, 'i');
        const m = text.match(re);
        if (!m) return "";
        return m[0].replace(new RegExp(`${title}:?`, 'i'), '').trim();
    };

    const names       = extract("STARTUP NAME SUGGESTIONS", "PRODUCT SUMMARY");
    const summary     = extract("PRODUCT SUMMARY",          "PROBLEM STATEMENT");
    const problem     = extract("PROBLEM STATEMENT",        "TARGET AUDIENCE");
    const audience    = extract("TARGET AUDIENCE",          "MARKET OPPORTUNITY");
    const opportunity = extract("MARKET OPPORTUNITY",       "SWOT ANALYSIS");
    const swot        = extract("SWOT ANALYSIS",            "PRODUCT MARKET FIT SCORE");
    const pmfStr      = extract("PRODUCT MARKET FIT SCORE", "INVESTOR READINESS SCORE");
    const invStr      = extract("INVESTOR READINESS SCORE", "REVENUE MODEL");
    const revenue     = extract("REVENUE MODEL",            "COMPETITOR ANALYSIS");
    const competitors = extract("COMPETITOR ANALYSIS",      "RISK FACTORS");
    const risks       = extract("RISK FACTORS",             "MVP ROADMAP");
    const roadmap     = extract("MVP ROADMAP",              "FINAL VERDICT");
    const verdict     = extract("FINAL VERDICT",            null);

    // Scores
    const pmfScore = (pmfStr.match(/Overall Score:\s*(\d+)/i) || [null, 75])[1];
    const invScore = (invStr.match(/Overall Score:\s*(\d+)/i) || [null, 70])[1];

    // SWOT parts
    const sStr = (swot.match(/Strengths:([\s\S]*?)Weaknesses:/i)    || ["",""])[1];
    const wStr = (swot.match(/Weaknesses:([\s\S]*?)Opportunities:/i) || ["",""])[1];
    const oStr = (swot.match(/Opportunities:([\s\S]*?)Threats:/i)   || ["",""])[1];
    const tStr = (swot.match(/Threats:([\s\S]*?)$/i)               || ["",""])[1];

    // Roadmap phases
    let roadmapHtml = "";
    const phases = roadmap.split(/Phase \d+:/i).filter(p => p.trim());
    phases.forEach((p, i) => {
        roadmapHtml += `<div class="phase"><h4>Phase ${i + 1}</h4>${listify(p)}</div>`;
    });

    // Names
    const nameBadges = names
        .split("\n")
        .filter(n => n.trim().startsWith("-"))
        .map(n => `<span class="n-badge">${n.replace("-", "").trim()}</span>`)
        .join("");

    resultBox.innerHTML = `

        <!-- Names -->
        <div class="widget fade-in">
            <div class="widget-label"><span class="wl-dot dot-purple"></span>Startup Name Suggestions</div>
            <div class="names-wrap">${nameBadges || "No names generated."}</div>
        </div>

        <!-- Scores -->
        <div class="dash-grid fade-in">
            <div class="widget score-widget">
                <div class="score-ring" style="--score:${pmfScore};">
                    <span class="score-val">${pmfScore}</span>
                </div>
                <div class="score-meta">
                    <div class="widget-label"><span class="wl-dot dot-purple"></span>Product-Market Fit</div>
                    <p>Market demand and scalability index</p>
                </div>
            </div>
            <div class="widget score-widget">
                <div class="score-ring ring-pink" style="--score:${invScore};">
                    <span class="score-val">${invScore}</span>
                </div>
                <div class="score-meta">
                    <div class="widget-label"><span class="wl-dot dot-pink"></span>Investor Readiness</div>
                    <p>Funding attractiveness and growth potential</p>
                </div>
            </div>
        </div>

        <!-- Summary + Problem -->
        <div class="dash-grid fade-in">
            <div class="widget">
                <div class="widget-label"><span class="wl-dot dot-green"></span>Product Summary</div>
                <div class="content">${listify(summary)}</div>
            </div>
            <div class="widget">
                <div class="widget-label"><span class="wl-dot dot-red"></span>Problem Statement</div>
                <div class="content">${listify(problem)}</div>
            </div>
        </div>

        <!-- SWOT -->
        <div class="widget fade-in">
            <div class="widget-label"><span class="wl-dot dot-yellow"></span>SWOT Matrix</div>
            <div class="swot-grid">
                <div class="swot-item s-str"><h4>Strengths</h4>${listify(sStr)}</div>
                <div class="swot-item s-wk"><h4>Weaknesses</h4>${listify(wStr)}</div>
                <div class="swot-item s-opp"><h4>Opportunities</h4>${listify(oStr)}</div>
                <div class="swot-item s-thr"><h4>Threats</h4>${listify(tStr)}</div>
            </div>
        </div>

        <!-- Audience + Market -->
        <div class="dash-grid fade-in">
            <div class="widget">
                <div class="widget-label"><span class="wl-dot dot-blue"></span>Target Audience</div>
                <div class="content">${listify(audience)}</div>
            </div>
            <div class="widget">
                <div class="widget-label"><span class="wl-dot dot-green"></span>Market Opportunity</div>
                <div class="content">${listify(opportunity)}</div>
            </div>
        </div>

        <!-- Revenue Model -->
        <div class="widget fade-in">
            <div class="widget-label"><span class="wl-dot dot-yellow"></span>Revenue Model</div>
            <div class="content">${listify(revenue)}</div>
        </div>

        <!-- MVP Roadmap -->
        <div class="widget fade-in">
            <div class="widget-label"><span class="wl-dot dot-purple"></span>MVP Execution Roadmap</div>
            <div class="roadmap">${roadmapHtml || listify(roadmap)}</div>
        </div>

        <!-- Competitors + Risks -->
        <div class="dash-grid fade-in">
            <div class="widget">
                <div class="widget-label"><span class="wl-dot dot-red"></span>Competitor Analysis</div>
                <div class="content">${listify(competitors)}</div>
            </div>
            <div class="widget">
                <div class="widget-label"><span class="wl-dot dot-yellow"></span>Risk Factors</div>
                <div class="content">${listify(risks)}</div>
            </div>
        </div>

        <!-- Final Verdict -->
        <div class="widget verdict-widget fade-in">
            <div class="widget-label"><span class="wl-dot dot-pink"></span>Final Verdict & Strategy</div>
            <div class="content">${paragraphify(verdict)}</div>
        </div>
    `;
}

/* Converts bullet-point text to an <ul> HTML list */
function listify(text) {
    if (!text) return "";
    let inList = false, html = "";
    text.split("\n").filter(l => l.trim()).forEach(line => {
        line = line.trim();
        if (line.startsWith("-") || line.startsWith("•")) {
            if (!inList) { html += "<ul>"; inList = true; }
            html += `<li>${line.substring(1).trim()}</li>`;
        } else {
            if (inList) { html += "</ul>"; inList = false; }
            html += `<p>${line}</p>`;
        }
    });
    if (inList) html += "</ul>";
    return html;
}

/* Converts multi-line text into paragraphs */
function paragraphify(text) {
    if (!text) return "";
    return text.split("\n").filter(p => p.trim()).map(p => {
        if (p.trim().startsWith("-")) return `<li>${p.trim().substring(1)}</li>`;
        return `<p>${p}</p>`;
    }).join("");
}