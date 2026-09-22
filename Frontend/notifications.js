(function () {

    const API = window.LOOPWEAR_API;

    let previousUnreadCount = null;

    function getUser() {
        const raw = localStorage.getItem("loopwearUser");

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            return null;
        }
    }


    // ========================================
    // CREATE BADGE
    // ========================================

    function createBadge(target, className) {

        if (!target) {
            return null;
        }

        let badge = target.querySelector("." + className);

        if (!badge) {

            badge = document.createElement("span");

            badge.className = className;

            target.style.position = "relative";

            target.appendChild(badge);
        }

        return badge;
    }


    // ========================================
    // GLOBAL BADGES
    // ========================================

    function updateGlobalBadges(count) {

        const visibleCount = Math.min(count, 9);


        // MY LOOP
        const myLoopLinks =
            document.querySelectorAll(
                'a[href="dashboard.html"]'
            );

        myLoopLinks.forEach(link => {

            const badge =
                createBadge(
                    link,
                    "loop-message-badge"
                );

            if (!badge) return;

            if (count > 0) {

                badge.textContent =
                    visibleCount;

                badge.style.display =
                    "flex";

            } else {

                badge.style.display =
                    "none";
            }
        });


        // SWAP REQUESTS
        const swapLinks =
            document.querySelectorAll(
                'a[href="swap-requests.html"], .swap-request-link'
            );

        swapLinks.forEach(link => {

            const badge =
                createBadge(
                    link,
                    "loop-swap-badge"
                );

            if (!badge) return;

            if (count > 0) {

                badge.textContent =
                    visibleCount;

                badge.style.display =
                    "flex";

            } else {

                badge.style.display =
                    "none";
            }
        });


        // PROFILE
        const profileLinks =
            document.querySelectorAll(
                ".profile-link, .profile-button, .user-profile"
            );

        profileLinks.forEach(link => {

            const badge =
                createBadge(
                    link,
                    "loop-profile-badge"
                );

            if (!badge) return;

            if (count > 0) {

                badge.textContent =
                    visibleCount;

                badge.style.display =
                    "flex";

            } else {

                badge.style.display =
                    "none";
            }
        });


        // CHAT LINKS
        const chatLinks =
            document.querySelectorAll(
                'a[href*="chat"], .chat-link'
            );

        chatLinks.forEach(link => {

            const badge =
                createBadge(
                    link,
                    "loop-chat-badge"
                );

            if (!badge) return;

            if (count > 0) {

                badge.textContent =
                    visibleCount;

                badge.style.display =
                    "flex";

            } else {

                badge.style.display =
                    "none";
            }
        });
    }


    // ========================================
    // PER CONVERSATION BADGES
    // ========================================

    function updateConversationBadges(messages) {

        const unreadBySwap = {};

        messages.forEach(message => {

            const swapRequest =
                message.swapRequest;

            if (!swapRequest) {
                return;
            }

            const swapId =
                typeof swapRequest === "object"
                    ? swapRequest._id
                    : swapRequest;

            if (!swapId) {
                return;
            }

            unreadBySwap[swapId] =
                (unreadBySwap[swapId] || 0) + 1;
        });


        // ========================================
        // REQUEST / ITEM CARDS
        // ========================================

        document
            .querySelectorAll(
                ".request-card[data-request-id]"
            )
            .forEach(card => {

                const requestId =
                    card.dataset.requestId;

                const count =
                    unreadBySwap[requestId] || 0;

                let badge =
                    card.querySelector(
                        ".item-message-badge"
                    );

                if (count > 0) {

                    if (!badge) {

                        badge =
                            document.createElement("span");

                        badge.className =
                            "item-message-badge";

                        card.style.position =
                            "relative";

                        card.appendChild(badge);
                    }

                    badge.textContent =
                        Math.min(count, 9);

                    badge.style.display =
                        "flex";

                } else if (badge) {

                    badge.remove();
                }
            });


        // ========================================
        // CHAT / NEGOTIATION BUTTON
        // ========================================

        document
            .querySelectorAll(
                ".chat-request-btn[data-request-id]"
            )
            .forEach(button => {

                const requestId =
                    button.dataset.requestId;

                const count =
                    unreadBySwap[requestId] || 0;

                let badge =
                    button.querySelector(
                        ".chat-button-badge"
                    );

                if (count > 0) {

                    if (!badge) {

                        badge =
                            document.createElement("span");

                        badge.className =
                            "chat-button-badge";

                        button.style.position =
                            "relative";

                        button.appendChild(badge);
                    }

                    badge.textContent =
                        Math.min(count, 9);

                    badge.style.display =
                        "flex";

                } else if (badge) {

                    badge.remove();
                }
            });
    }


    // ========================================
    // TOAST
    // ========================================

    function showMessageToast() {

        let toast =
            document.getElementById(
                "loopMessageToast"
            );

        if (!toast) {

            toast =
                document.createElement("div");

            toast.id =
                "loopMessageToast";

            toast.innerHTML = `
                <div class="loop-toast-icon">
                    💬
                </div>

                <div class="loop-toast-content">
                    <strong>New message</strong>
                    <span>
                        You have a new swap message.
                    </span>
                </div>

                <button
                    type="button"
                    class="loop-toast-close"
                >
                    ×
                </button>
            `;

            document.body.appendChild(toast);

            toast
                .querySelector(
                    ".loop-toast-close"
                )
                .addEventListener(
                    "click",
                    function () {

                        toast.classList.remove(
                            "show"
                        );
                    }
                );
        }

        toast.classList.add("show");

        clearTimeout(
            toast.hideTimer
        );

        toast.hideTimer =
            setTimeout(
                function () {

                    toast.classList.remove(
                        "show"
                    );

                },
                5000
            );
    }


    // ========================================
    // CHECK UNREAD
    // ========================================

    async function checkUnreadMessages() {

        const user = getUser();

        if (!user || !user.id) {
            return;
        }

        try {

            const response =
                await fetch(
                    `${API}/messages/unread/${encodeURIComponent(user.id)}`
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                return;
            }

            const count =
                Number(data.count || 0);

            const messages =
                Array.isArray(data.messages)
                    ? data.messages
                    : [];


            // Global badges
            updateGlobalBadges(count);


            // Item cards + chat buttons
            updateConversationBadges(
                messages
            );


            // First load should not show toast
            if (
                previousUnreadCount === null
            ) {

                previousUnreadCount =
                    count;

                return;
            }


            // New message arrived
            if (
                count >
                previousUnreadCount
            ) {

                showMessageToast();
            }


            previousUnreadCount =
                count;

        } catch (error) {

            console.error(
                "Notification check error:",
                error
            );
        }
    }


    // ========================================
    // CSS
    // ========================================

    const style =
        document.createElement("style");

    style.textContent = `

        /* GLOBAL BADGES */

        .loop-message-badge,
        .loop-swap-badge,
        .loop-profile-badge,
        .loop-chat-badge {

            position: absolute;

            top: -7px;
            right: -10px;

            min-width: 19px;
            height: 19px;

            padding: 0 5px;

            border-radius: 999px;

            background: #ff3b30;

            color: #ffffff;

            border: 2px solid #171717;

            display: none;

            align-items: center;
            justify-content: center;

            font-size: 10px;

            font-weight: 900;

            line-height: 1;

            z-index: 50;
        }


        /* ITEM CARD */

        .item-message-badge {

            position: absolute;

            top: 14px;
            right: 14px;

            min-width: 24px;
            height: 24px;

            padding: 0 6px;

            border-radius: 999px;

            background: #ff3b30;

            color: #ffffff;

            border: 3px solid #ffffff;

            display: flex;

            align-items: center;
            justify-content: center;

            font-size: 11px;

            font-weight: 900;

            z-index: 20;

            box-shadow:
                0 3px 10px rgba(0,0,0,.18);
        }


        /* CHAT BUTTON */

        .chat-button-badge {

            position: absolute;

            top: -8px;
            right: -8px;

            min-width: 19px;
            height: 19px;

            padding: 0 5px;

            border-radius: 999px;

            background: #ff3b30;

            color: #ffffff;

            border: 2px solid #171717;

            display: flex;

            align-items: center;
            justify-content: center;

            font-size: 10px;

            font-weight: 900;

            z-index: 30;
        }


        /* NEW MESSAGE TOAST */

        #loopMessageToast {

            position: fixed;

            right: 24px;
            bottom: 24px;

            width:
                min(
                    370px,
                    calc(100vw - 32px)
                );

            display: flex;

            align-items: center;

            gap: 13px;

            padding: 15px 17px;

            background: #171717;

            color: #ffffff;

            border: 2px solid #c8ff32;

            border-radius: 16px;

            box-shadow:
                6px 6px 0 #c8ff32;

            z-index: 99999;

            opacity: 0;

            transform:
                translateY(20px)
                scale(.97);

            pointer-events: none;

            transition:
                opacity .2s ease,
                transform .2s ease;
        }


        #loopMessageToast.show {

            opacity: 1;

            transform:
                translateY(0)
                scale(1);

            pointer-events: auto;
        }


        .loop-toast-icon {

            width: 40px;
            height: 40px;

            flex: 0 0 40px;

            display: flex;

            align-items: center;
            justify-content: center;

            background: #c8ff32;

            color: #171717;

            border-radius: 50%;

            font-size: 19px;
        }


        .loop-toast-content {

            display: flex;

            flex-direction: column;

            gap: 3px;

            flex: 1;
        }


        .loop-toast-content strong {

            font-size: 14px;

            font-weight: 900;
        }


        .loop-toast-content span {

            font-size: 12px;

            color: #d6d6d6;
        }


        .loop-toast-close {

            border: 0;

            background: transparent;

            color: #ffffff;

            font-size: 22px;

            cursor: pointer;

            padding: 3px 6px;
        }


        @media (max-width: 600px) {

            #loopMessageToast {

                right: 16px;
                bottom: 16px;
            }
        }

    `;

    document.head.appendChild(style);


    // ========================================
    // START
    // ========================================

    checkUnreadMessages();

    setInterval(
        checkUnreadMessages,
        3000
    );


    // ========================================
    // WATCH DYNAMIC REQUEST CARDS
    // ========================================

    const observer =
        new MutationObserver(
            function () {

                const user = getUser();

                if (user && user.id) {
                    checkUnreadMessages();
                }
            }
        );

    observer.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );

})();