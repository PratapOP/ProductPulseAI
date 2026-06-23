// static/script.js

const analyzeBtn = document.getElementById("analyzeBtn");
const ideaInput = document.getElementById("ideaInput");

const emptyState = document.getElementById("emptyState");
const loadingSection = document.getElementById("loadingSection");
const resultContainer = document.getElementById("resultContainer");

analyzeBtn.addEventListener("click", async () => {
    const idea = ideaInput.value.trim();
    if (!idea) {
        alert("Please provide a product concept to analyze.");
        return;
    }

    // UI Updates for loading
    emptyState.classList.add("hidden");
    resultContainer.classList.add("hidden");
    loadingSection.classList.remove("hidden");
    
    analyzeBtn.disabled = true;
    analyzeBtn.innerText = "Processing...";

    try {
        const response = await fetch("/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idea: idea })
        });

        const data = await response.json();

        if(data.success) {
            renderDashboard(data.result);
            loadingSection.classList.add("hidden");
            resultContainer.classList.remove("hidden");
            resultContainer.classList.add("fade-in");
        } else {
            throw new Error(data.result);
        }
    } catch (error) {
        loadingSection.classList.add("hidden");
        resultContainer.classList.remove("hidden");
        resultContainer.innerHTML = `<div class="widget" style="border-color: #ef4444;"><h3 style="color:#ef4444;">Analysis Error</h3><p>${error.message}</p></div>`;
    }

    analyzeBtn.disabled = false;
    analyzeBtn.innerText = "⚡ Initialize Analysis";
});

function renderDashboard(text) {
    // Basic cleanup
    text = text.replace(/\*\*/g, ""); // remove bold markers

    // Helper to extract sections
    const extractSection = (title, nextTitle) => {
        const regex = new RegExp(`${title}:?[\\s\\S]*?(?=${nextTitle || '$'})`, 'i');
        const match = text.match(regex);
        if(!match) return "";
        let content = match[0].replace(new RegExp(`${title}:?`, 'i'), '').trim();
        return content;
    };

    const names = extractSection("STARTUP NAME SUGGESTIONS", "PRODUCT SUMMARY");
    const summary = extractSection("PRODUCT SUMMARY", "PROBLEM STATEMENT");
    const problem = extractSection("PROBLEM STATEMENT", "TARGET AUDIENCE");
    const audience = extractSection("TARGET AUDIENCE", "MARKET OPPORTUNITY");
    const opportunity = extractSection("MARKET OPPORTUNITY", "SWOT ANALYSIS");
    
    const swot = extractSection("SWOT ANALYSIS", "PRODUCT MARKET FIT SCORE");
    
    const pmfStr = extractSection("PRODUCT MARKET FIT SCORE", "INVESTOR READINESS SCORE");
    const invStr = extractSection("INVESTOR READINESS SCORE", "REVENUE MODEL");
    
    const revenue = extractSection("REVENUE MODEL", "COMPETITOR ANALYSIS");
    const competitors = extractSection("COMPETITOR ANALYSIS", "RISK FACTORS");
    const risks = extractSection("RISK FACTORS", "MVP ROADMAP");
    const roadmap = extractSection("MVP ROADMAP", "FINAL VERDICT");
    const verdict = extractSection("FINAL VERDICT", null);

    // Extract Overall Scores
    const pmfScoreMatch = pmfStr.match(/Overall Score:\s*(\d+)/i);
    const pmfScore = pmfScoreMatch ? pmfScoreMatch[1] : 75;

    const invScoreMatch = invStr.match(/Overall Score:\s*(\d+)/i);
    const invScore = invScoreMatch ? invScoreMatch[1] : 70;

    // Parse SWOT
    const sMatch = swot.match(/Strengths:([\s\S]*?)Weaknesses:/i) || ["",""];
    const wMatch = swot.match(/Weaknesses:([\s\S]*?)Opportunities:/i) || ["",""];
    const oMatch = swot.match(/Opportunities:([\s\S]*?)Threats:/i) || ["",""];
    const tMatch = swot.match(/Threats:([\s\S]*?)$/i) || ["",""];

    // Parse Roadmap
    let roadmapHtml = '';
    const phases = roadmap.split(/Phase \d+:/i).filter(p => p.trim() !== '');
    phases.forEach((p, idx) => {
        roadmapHtml += `
            <div class="phase">
                <h4>Phase ${idx + 1}</h4>
                ${formatList(p)}
            </div>
        `;
    });

    // Build Names Badges
    const namesList = names.split('\n').filter(n => n.trim().startsWith('-')).map(n => n.replace('-', '').trim());
    const namesHtml = namesList.map(n => `<div class="name-badge">${n}</div>`).join('');

    const html = `
        <div style="margin-bottom: 20px;">
            <div class="widget-title"><span class="dot dot-purple"></span>Generated Nomenclature</div>
            <div class="names-grid">${namesHtml || 'No names generated.'}</div>
        </div>

        <div class="dashboard-grid" style="margin-bottom: 22px;">
            <div class="widget score-widget">
                <div class="score-circle" style="--score: ${pmfScore};">
                    <span class="score-value">${pmfScore}</span>
                </div>
                <div class="score-info">
                    <div class="widget-title"><span class="dot dot-purple"></span>Product-Market Fit</div>
                    <p>Market Demand &amp; Scalability</p>
                </div>
            </div>
            <div class="widget score-widget">
                <div class="score-circle investor" style="--score: ${invScore};">
                    <span class="score-value">${invScore}</span>
                </div>
                <div class="score-info">
                    <div class="widget-title"><span class="dot dot-pink"></span>Investor Readiness</div>
                    <p>Funding Attractiveness</p>
                </div>
            </div>
        </div>

        <div class="dashboard-grid" style="margin-bottom: 22px;">
            <div class="widget">
                <div class="widget-title"><span class="dot dot-green"></span>Product Summary</div>
                <div class="content-block">${formatList(summary)}</div>
            </div>
            <div class="widget">
                <div class="widget-title"><span class="dot dot-red"></span>Problem Statement</div>
                <div class="content-block">${formatList(problem)}</div>
            </div>
        </div>

        <div class="widget" style="margin-bottom: 22px;">
            <div class="widget-title"><span class="dot dot-yellow"></span>SWOT Matrix</div>
            <div class="swot-grid">
                <div class="swot-item strengths">
                    <h4>⚡ Strengths</h4>
                    ${formatList(sMatch[1])}
                </div>
                <div class="swot-item weaknesses">
                    <h4>⚠ Weaknesses</h4>
                    ${formatList(wMatch[1])}
                </div>
                <div class="swot-item opportunities">
                    <h4>✦ Opportunities</h4>
                    ${formatList(oMatch[1])}
                </div>
                <div class="swot-item threats">
                    <h4>⚑ Threats</h4>
                    ${formatList(tMatch[1])}
                </div>
            </div>
        </div>

        <div class="dashboard-grid" style="margin-bottom: 22px;">
            <div class="widget">
                <div class="widget-title"><span class="dot dot-blue"></span>Target Audience</div>
                <div class="content-block">${formatList(audience)}</div>
            </div>
            <div class="widget">
                <div class="widget-title"><span class="dot dot-green"></span>Market Opportunity</div>
                <div class="content-block">${formatList(opportunity)}</div>
            </div>
        </div>

        <div class="widget" style="margin-bottom: 22px;">
            <div class="widget-title"><span class="dot dot-yellow"></span>Revenue Model</div>
            <div class="content-block">${formatList(revenue)}</div>
        </div>

        <div class="widget" style="margin-bottom: 22px;">
            <div class="widget-title"><span class="dot dot-purple"></span>MVP Execution Roadmap</div>
            <div class="roadmap">
                ${roadmapHtml || formatList(roadmap)}
            </div>
        </div>

        <div class="dashboard-grid" style="margin-bottom: 22px;">
            <div class="widget">
                <div class="widget-title"><span class="dot dot-red"></span>Competitor Analysis</div>
                <div class="content-block">${formatList(competitors)}</div>
            </div>
            <div class="widget">
                <div class="widget-title"><span class="dot dot-yellow"></span>Risk Factors</div>
                <div class="content-block">${formatList(risks)}</div>
            </div>
        </div>

        <div class="widget verdict-widget">
            <div class="widget-title"><span class="dot dot-pink"></span>Final Verdict &amp; Strategy</div>
            <div class="content-block">${formatParagraphs(verdict)}</div>
        </div>
    `;

    resultContainer.innerHTML = html;
}

function formatList(text) {
    if (!text) return '';
    const lines = text.split('\n').filter(l => l.trim() !== '');
    let isList = false;
    let html = '';
    
    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith('-') || line.startsWith('•')) {
            if (!isList) { html += '<ul>'; isList = true; }
            html += `<li>${line.substring(1).trim()}</li>`;
        } else {
            if (isList) { html += '</ul>'; isList = false; }
            html += `<p>${line}</p>`;
        }
    });
    if (isList) html += '</ul>';
    return html;
}

function formatParagraphs(text) {
    if (!text) return '';
    return text.split('\n').filter(p => p.trim() !== '').map(p => {
        if(p.trim().startsWith('-')) return `<li>${p.trim().substring(1)}</li>`;
        return `<p style="margin-bottom: 8px;">${p}</p>`;
    }).join('');
}