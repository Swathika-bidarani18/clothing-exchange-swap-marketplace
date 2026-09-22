const historyList = document.getElementById("historyList");
const historyCount = document.getElementById("historyCount");

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateValue) {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

async function loadSwapHistory() {
    const userData = localStorage.getItem("loopwearUser");

    if (!userData) {
        window.location.href = "login.html";
        return;
    }

    let loggedInUser;

    try {
        loggedInUser = JSON.parse(userData);
    } catch (error) {
        localStorage.removeItem("loopwearUser");
        window.location.href = "login.html";
        return;
    }

    if (!loggedInUser.id) {
        localStorage.removeItem("loopwearUser");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(
            `${window.LOOPWEAR_API}/swap-requests/history/${encodeURIComponent(loggedInUser.id)}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load swap history.");
        }

        const history = Array.isArray(data.history) ? data.history : [];

        historyCount.textContent = `${history.length} ${history.length === 1 ? "activity" : "activities"}`;

        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="history-empty">
                    <h3>Your Loop journey starts here.</h3>
                    <p>
                        You don't have any swap activity yet. Browse clothes and send your first request.
                    </p>
                    <a href="index.html#browse" class="primary-btn">Browse Clothes</a>
                </div>
            `;
            return;
        }

        historyList.innerHTML = history.map(function (request) {
            const isRequester =
                request.requester &&
                String(request.requester._id) === String(loggedInUser.id);

            const clothing = request.clothing || {};
            const otherPerson = isRequester ? request.owner : request.requester;

            const direction = isRequester
                ? `You requested ${escapeHtml(otherPerson?.name || "another member")}`
                : `${escapeHtml(otherPerson?.name || "A member")} requested your clothing`;

            const status = String(request.status || "Pending").toLowerCase();

            return `
                <article class="history-card">
                    <div class="history-image">
                        <img
                            src="${escapeHtml(clothing.image || "")}" 
                            alt="${escapeHtml(clothing.name || "Clothing item")}" 
                            onerror="this.style.display='none'"
                        >
                    </div>

                    <div class="history-content">
                        <p class="history-direction">${direction}</p>
                        <h3>${escapeHtml(clothing.name || "Clothing item")}</h3>
                        <p class="history-detail">
                            ${escapeHtml(clothing.category || "Clothing")} ·
                            ${escapeHtml(clothing.size || "Size not specified")} ·
                            ${escapeHtml(clothing.condition || "Condition not specified")}
                        </p>
                        <p class="history-detail">
                            ${isRequester ? "Owner" : "Requester"}: ${escapeHtml(otherPerson?.name || "Member")}
                        </p>
                        <p class="history-date">Requested on ${formatDate(request.createdAt)}</p>
                    </div>

                    <div class="history-status ${status}">
                        ${escapeHtml(request.status || "Pending")}
                    </div>
                </article>
            `;
        }).join("");

    } catch (error) {
        console.error("Swap history error:", error);

        historyCount.textContent = "Unavailable";

        historyList.innerHTML = `
            <div class="history-error">
                <h3>We couldn't load your Loop journey.</h3>
                <p>
                    Make sure the LoopWear backend is running, then refresh this page.
                </p>
                <button type="button" class="primary-btn" onclick="loadSwapHistory()">
                    Try Again
                </button>
            </div>
        `;
    }
}

loadSwapHistory();
