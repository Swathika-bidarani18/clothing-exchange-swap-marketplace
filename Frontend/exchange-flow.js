// ========================================
// LOOPWEAR - COMPLETE EXCHANGE FLOW
// ========================================

(function () {
    "use strict";

    const API = window.LOOPWEAR_API;

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getLoggedInUser() {
        const raw = localStorage.getItem("loopwearUser");
        if (!raw) return null;

        try {
            return JSON.parse(raw);
        } catch (error) {
            localStorage.removeItem("loopwearUser");
            return null;
        }
    }

    // ========================================
    // CENTERED LOOPWEAR MODAL
    // ========================================

    function ensureModal() {
        let modal = document.getElementById("loopwearModal");
        if (modal) return modal;

        modal = document.createElement("div");
        modal.id = "loopwearModal";
        modal.className = "loop-modal";
        modal.innerHTML = `
            <div class="loop-modal-backdrop"></div>
            <div class="loop-modal-card" role="dialog" aria-modal="true">
                <button type="button" class="loop-modal-close" aria-label="Close">×</button>
                <p class="loop-modal-label">LOOPWEAR</p>
                <h2 class="loop-modal-title"></h2>
                <div class="loop-modal-message"></div>
                <div class="loop-modal-actions"></div>
            </div>
        `;

        document.body.appendChild(modal);

        const close = () => modal.classList.remove("is-open");
        modal.querySelector(".loop-modal-backdrop").addEventListener("click", close);
        modal.querySelector(".loop-modal-close").addEventListener("click", close);

        return modal;
    }

    function closeModal() {
        const modal = document.getElementById("loopwearModal");
        if (modal) modal.classList.remove("is-open");
    }

    function showModal(title, message, options = {}) {
        const modal = ensureModal();
        const actions = modal.querySelector(".loop-modal-actions");

        modal.querySelector(".loop-modal-title").textContent = title;
        modal.querySelector(".loop-modal-message").innerHTML = message;
        actions.innerHTML = "";

        if (options.buttons) {
            options.buttons.forEach(button => {
                const element = document.createElement("button");
                element.type = "button";
                element.className = button.className || "modal-primary-btn";
                element.textContent = button.text;
                element.addEventListener("click", async () => {
                    if (button.onClick) await button.onClick(modal);
                });
                actions.appendChild(element);
            });
        } else {
            const element = document.createElement("button");
            element.type = "button";
            element.className = "modal-primary-btn";
            element.textContent = options.buttonText || "Continue";
            element.addEventListener("click", closeModal);
            actions.appendChild(element);
        }

        modal.classList.add("is-open");
        return modal;
    }

    // ========================================
    // ITEM DETAILS - SEND A REAL SWAP OFFER
    // ========================================

    const requestSwapButton = document.getElementById("requestSwapButton");

    if (requestSwapButton) {
        requestSwapButton.addEventListener("click", async function () {
            const user = getLoggedInUser();

            if (!user) {
                showModal(
                    "Login required",
                    "Please log in or register before starting a swap.",
                    {
                        buttons: [{
                            text: "Go to Login",
                            className: "modal-primary-btn",
                            onClick: () => { window.location.href = "login.html"; }
                        }]
                    }
                );
                return;
            }

            const params = new URLSearchParams(window.location.search);
            const itemId = params.get("itemId");

            if (!itemId) {
                showModal("Item unavailable", "This clothing item could not be identified.", { type: "error" });
                return;
            }

            requestSwapButton.disabled = true;
            requestSwapButton.textContent = "Loading your closet...";

            try {
                const response = await fetch(`${API}/clothing`);
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.message || "Unable to load your closet.");
                }

                const myClothes = (data.clothing || []).filter(item =>
                    item.owner && String(item.owner._id) === String(user.id)
                );

                if (!myClothes.length) {
                    requestSwapButton.disabled = false;
                    requestSwapButton.textContent = "Request Swap";

                    showModal(
                        "Add a piece first",
                        "A real swap works by offering one of your own LoopWear clothes in return.<br><br>Add a clothing item to your closet, then come back to this piece.",
                        {
                            buttons: [{
                                text: "Add Clothing",
                                className: "modal-primary-btn",
                                onClick: () => { window.location.href = "add-clothing.html"; }
                            }]
                        }
                    );
                    return;
                }

                const options = myClothes.map(item => `
                    <option value="${escapeHtml(item._id)}">
                        ${escapeHtml(item.name)} · ${escapeHtml(item.size)} · ₹${escapeHtml(item.swapValue)}
                    </option>
                `).join("");

                const modal = showModal(
                    "Build your swap",
                    `
                        <p>Choose the clothing item you would like to offer in exchange.</p>
                        <label class="modal-field-label" for="offeredClothingSelect">YOUR OFFER</label>
                        <select id="offeredClothingSelect" class="modal-select">
                            ${options}
                        </select>
                        <p class="modal-hint">The other member will see your offer when they review the request.</p>
                    `,
                    {
                        buttons: [
                            {
                                text: "Cancel",
                                className: "modal-secondary-btn",
                                onClick: closeModal
                            },
                            {
                                text: "Send Request",
                                className: "modal-primary-btn",
                                onClick: async modalElement => {
                                    const select = modalElement.querySelector("#offeredClothingSelect");
                                    const offeredClothingId = select?.value;
                                    const sendButton = modalElement.querySelector(".modal-primary-btn");

                                    if (!offeredClothingId) return;

                                    sendButton.disabled = true;
                                    sendButton.textContent = "Sending...";

                                    try {
                                        const requestResponse = await fetch(`${API}/swap-requests`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                clothingId: itemId,
                                                requesterId: user.id,
                                                offeredClothingId
                                            })
                                        });

                                        const requestData = await requestResponse.json();

                                        if (!requestResponse.ok || !requestData.success) {
                                            throw new Error(requestData.message || "Unable to send swap request.");
                                        }

                                        closeModal();
                                        requestSwapButton.textContent = "Request Sent ✓";

                                        showModal(
                                            "Request sent",
                                            "Your offer is now with the clothing owner.<br><br>You can track the request from <strong>My Loop → Swap Requests</strong>.",
                                            {
                                                buttons: [{
                                                    text: "View Requests",
                                                    className: "modal-primary-btn",
                                                    onClick: () => { window.location.href = "swap-requests.html"; }
                                                }]
                                            }
                                        );
                                    } catch (error) {
                                        console.error("Swap request error:", error);
                                        sendButton.disabled = false;
                                        sendButton.textContent = "Send Request";
                                        showModal("Request not sent", escapeHtml(error.message || "Unable to connect to LoopWear server."));
                                    }
                                }
                            }
                        ]
                    }
                );

                requestSwapButton.disabled = false;
                requestSwapButton.textContent = "Choose Offer";
                void modal;
            } catch (error) {
                console.error("Load offer items error:", error);
                requestSwapButton.disabled = false;
                requestSwapButton.textContent = "Request Swap";
                showModal("Unable to load your closet", "Make sure the LoopWear backend is running, then try again.");
            }
        });
    }

    // ========================================
    // SWAP REQUESTS PAGE
    // ========================================

    const incomingRequests = document.getElementById("incomingRequests");
    const sentRequests = document.getElementById("sentRequests");
    const incomingCount = document.getElementById("incomingCount");
    const sentCount = document.getElementById("sentCount");

    if (!incomingRequests || !sentRequests || !incomingCount || !sentCount) return;

    function progressText(request) {
        switch (request.status) {
            case "Pending": return "Waiting for the owner to respond.";
            case "Accepted": return "Accepted — both members now confirm the exchange.";
            case "ExchangeConfirmed": return "Exchange confirmed — both members can complete the handover.";
            case "Completed": return "Completed — this Loop has reached its final step.";
            case "Rejected": return "The clothing owner rejected this request.";
            default: return "Swap activity recorded.";
        }
    }

    function offeredMarkup(request) {
        const offered = request.offeredClothing;
        if (!offered) {
            return `<p class="request-offer-note">No offer item was attached to this older request.</p>`;
        }

        return `
            <div class="request-offer">
                <div class="request-offer-image">
                    <img src="${escapeHtml(offered.image || "")}" alt="${escapeHtml(offered.name || "Offered clothing")}" onerror="this.style.display='none'">
                </div>
                <div>
                    <span>OFFERED IN RETURN</span>
                    <strong>${escapeHtml(offered.name || "Clothing item")}</strong>
                    <small>${escapeHtml(offered.size || "Size N/A")} · ₹${escapeHtml(offered.swapValue || 0)}</small>
                </div>
            </div>
        `;
    }

    function actionMarkup(request, role) {

    const buttons = [];

    const otherPerson =
        role === "owner"
            ? request.requester
            : request.owner;


    // ========================================
    // CHAT / NEGOTIATION
    // ========================================

    if (
        otherPerson &&
        request._id &&
        request.status !== "Rejected"
    ) {

        buttons.push(`
            <button
                type="button"
                class="chat-request-btn"
                data-request-id="${escapeHtml(request._id)}"
                data-receiver-id="${escapeHtml(otherPerson._id || "")}"
                data-receiver-name="${escapeHtml(otherPerson.name || "LoopWear member")}"
            >
                💬 Chat / Negotiate
            </button>
        `);
    }


    // ========================================
    // ACCEPT / REJECT
    // ========================================

    if (
        request.status === "Pending" &&
        role === "owner"
    ) {

        buttons.push(`
            <button
                class="accept-request-btn"
                data-request-id="${escapeHtml(request._id)}"
                data-action="accept"
            >
                Accept
            </button>
        `);

        buttons.push(`
            <button
                class="reject-request-btn"
                data-request-id="${escapeHtml(request._id)}"
                data-action="reject"
            >
                Reject
            </button>
        `);
    }


    // ========================================
    // CONFIRM EXCHANGE
    // ========================================

    if (request.status === "Accepted") {

        const confirmed =
            role === "owner"
                ? request.ownerConfirmed
                : request.requesterConfirmed;

        buttons.push(
            confirmed

                ? `
                    <span class="action-note">
                        ✓ You confirmed the exchange
                    </span>
                `

                : `
                    <button
                        class="confirm-exchange-btn"
                        data-request-id="${escapeHtml(request._id)}"
                    >
                        Confirm Exchange
                    </button>
                `
        );
    }


    // ========================================
    // CONFIRM HANDOVER
    // ========================================

    if (
        request.status === "ExchangeConfirmed"
    ) {

        const confirmed =
            role === "owner"
                ? request.ownerHandoverConfirmed
                : request.requesterHandoverConfirmed;

        buttons.push(
            confirmed

                ? `
                    <span class="action-note">
                        ✓ You confirmed handover
                    </span>
                `

                : `
                    <button
                        class="confirm-handover-btn"
                        data-request-id="${escapeHtml(request._id)}"
                    >
                        Mark Handover Done
                    </button>
                `
        );
    }


    return buttons.length
        ? `
            <div class="request-actions">
                ${buttons.join("")}
            </div>
        `
        : "";
}
    function card(request, role) {
        const target = request.clothing || {};
        const otherPerson = role === "owner" ? request.requester : request.owner;
        const statusClass = String(request.status || "Pending").toLowerCase();

        return `
            <article class="request-card">
                <div class="request-image">
                    ${target.image
                        ? `<img src="${escapeHtml(target.image)}" alt="${escapeHtml(target.name || "Clothing item")}" onerror="this.style.display='none'">`
                        : `<div class="request-image-placeholder">LW</div>`}
                </div>
                <div class="request-details">
                    <p class="request-label">${role === "owner" ? "INCOMING SWAP" : "REQUEST SENT"}</p>
                    <h3>${escapeHtml(target.name || "Clothing item")}</h3>
                    <p>${role === "owner" ? "Requested by" : "Owner"} <strong>${escapeHtml(otherPerson?.name || "LoopWear member")}</strong></p>
                    <p class="request-progress">${progressText(request)}</p>
                    <span class="request-status status-${statusClass}">${escapeHtml(request.status || "Pending")}</span>
                    ${offeredMarkup(request)}
                    ${actionMarkup(request, role)}
                </div>
            </article>
        `;
    }

    function renderIncoming(requests) {
        if (!requests.length) {
            incomingRequests.innerHTML = `
                <div class="request-empty">
                    <span class="empty-icon">↻</span>
                    <h3>No incoming requests yet.</h3>
                    <p>When someone wants to swap for one of your clothes, their request will appear here.</p>
                </div>`;
            return;
        }

        incomingRequests.innerHTML = requests.map(request => card(request, "owner")).join("");
    }

    function renderSent(requests) {
        if (!requests.length) {
            sentRequests.innerHTML = `
                <div class="request-empty">
                    <span class="empty-icon">→</span>
                    <h3>No sent requests yet.</h3>
                    <p>Browse clothes and send a swap request to start your next Loop.</p>
                    <a href="index.html#browse" class="primary-btn">Browse Clothes</a>
                </div>`;
            return;
        }

        sentRequests.innerHTML = requests.map(request => card(request, "requester")).join("");
    }

    async function loadRequests() {
        const user = getLoggedInUser();
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        try {
            const response = await fetch(`${API}/swap-requests/history/${encodeURIComponent(user.id)}`);
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to load swap requests.");
            }

            const history = Array.isArray(data.history) ? data.history : [];
            const incoming = history.filter(item => item.owner && String(item.owner._id) === String(user.id));
            const sent = history.filter(item => item.requester && String(item.requester._id) === String(user.id));

            incomingCount.textContent = `${incoming.length} ${incoming.length === 1 ? "request" : "requests"}`;
            sentCount.textContent = `${sent.length} ${sent.length === 1 ? "request" : "requests"}`;

            renderIncoming(incoming);
            renderSent(sent);
            bindActions();
        } catch (error) {
            console.error("Load swap requests error:", error);
            const errorHtml = `
                <div class="request-empty">
                    <span class="empty-icon">!</span>
                    <h3>Unable to load requests.</h3>
                    <p>Make sure the LoopWear backend is running and try again.</p>
                </div>`;
            incomingRequests.innerHTML = errorHtml;
            sentRequests.innerHTML = errorHtml;
        }
    }

    function openDecision(requestId, status) {
        const accepting = status === "Accepted";

        showModal(
            accepting ? "Accept this Loop?" : "Reject this request?",
            accepting
                ? "The requester will be notified that you accepted. Both members will then confirm the exchange before handover."
                : "This request will be marked as rejected and the requester will see the updated status.",
            {
                buttons: [
                    { text: "Cancel", className: "modal-secondary-btn", onClick: closeModal },
                    {
                        text: accepting ? "Accept Request" : "Reject Request",
                        className: accepting ? "modal-primary-btn" : "modal-danger-btn",
                        onClick: () => updateRequest(requestId, { status })
                    }
                ]
            }
        );
    }

    async function updateRequest(requestId, payload) {
        const user = getLoggedInUser();
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        try {
            const response = await fetch(`${API}/swap-requests/${requestId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...payload, userId: user.id })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to update this swap.");
            }

            closeModal();

            let title = "Loop updated";
            if (payload.status === "Accepted") title = "Swap accepted";
            if (payload.status === "Rejected") title = "Request rejected";
            if (payload.action === "confirm_exchange") title = data.swapRequest?.status === "ExchangeConfirmed" ? "Exchange confirmed" : "Confirmation recorded";
            if (payload.action === "confirm_handover") title = data.swapRequest?.status === "Completed" ? "Loop completed" : "Handover recorded";

            showModal(title, escapeHtml(data.message || "Your Loop was updated."), { type: "success" });
            await loadRequests();
        } catch (error) {
            console.error("Update swap request error:", error);
            closeModal();
            showModal("Update failed", escapeHtml(error.message || "Unable to connect to LoopWear server."));
        }
    }

    function bindActions() {

    // ========================================
    // CHAT / NEGOTIATION
    // ========================================

    document
        .querySelectorAll(".chat-request-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                const requestId =
                    button.dataset.requestId;

                const receiverId =
                    button.dataset.receiverId;

                const receiverName =
                    button.dataset.receiverName ||
                    "LoopWear member";


                if (!requestId || !receiverId) {

                    showModal(
                        "Chat unavailable",
                        "The swap participants could not be identified."
                    );

                    return;
                }


                const params =
                    new URLSearchParams({
                        swapRequestId: requestId,
                        receiverId: receiverId,
                        receiverName: receiverName
                    });


                window.location.href =
                    `chat.html?${params.toString()}`;
            });
        });


    // ========================================
    // ACCEPT REQUEST
    // ========================================

    document
        .querySelectorAll("[data-action='accept']")
        .forEach(button => {

            button.addEventListener("click", () => {

                openDecision(
                    button.dataset.requestId,
                    "Accepted"
                );
            });
        });


    // ========================================
    // REJECT REQUEST
    // ========================================

    document
        .querySelectorAll("[data-action='reject']")
        .forEach(button => {

            button.addEventListener("click", () => {

                openDecision(
                    button.dataset.requestId,
                    "Rejected"
                );
            });
        });


    // ========================================
    // CONFIRM EXCHANGE
    // ========================================

    document
        .querySelectorAll(".confirm-exchange-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                showModal(
                    "Confirm the exchange?",
                    "This means you agree to the requested clothing swap. Both members must confirm before handover is unlocked.",
                    {
                        buttons: [

                            {
                                text: "Cancel",
                                className: "modal-secondary-btn",
                                onClick: closeModal
                            },

                            {
                                text: "Confirm Exchange",
                                className: "modal-primary-btn",

                                onClick: () =>
                                    updateRequest(
                                        button.dataset.requestId,
                                        {
                                            action:
                                                "confirm_exchange"
                                        }
                                    )
                            }

                        ]
                    }
                );
            });
        });


    // ========================================
    // CONFIRM HANDOVER
    // ========================================

    document
        .querySelectorAll(".confirm-handover-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                showModal(
                    "Mark handover complete?",
                    "Use this after the clothing has actually been handed over or the simulated delivery step has been completed.",
                    {
                        buttons: [

                            {
                                text: "Cancel",
                                className: "modal-secondary-btn",
                                onClick: closeModal
                            },

                            {
                                text: "Mark Handover Done",
                                className: "modal-primary-btn",

                                onClick: () =>
                                    updateRequest(
                                        button.dataset.requestId,
                                        {
                                            action:
                                                "confirm_handover"
                                        }
                                    )
                            }

                        ]
                    }
                );
            });
        });
}

    loadRequests();
})();
