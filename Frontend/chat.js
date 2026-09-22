// ========================================
// LOOPWEAR CHAT / NEGOTIATION
// ========================================

const CHAT_API = window.LOOPWEAR_API;

const chatBox =
    document.getElementById("chatBox");

const chatForm =
    document.getElementById("chatForm");

const messageInput =
    document.getElementById("messageInput");

const sendMessageBtn =
    document.getElementById("sendMessageBtn");

const chatSubtitle =
    document.getElementById("chatSubtitle");

const chatAvatar =
    document.getElementById("chatAvatar");

const swapItemImage =
    document.getElementById("swapItemImage");

const swapItemName =
    document.getElementById("swapItemName");

const swapItemValue =
    document.getElementById("swapItemValue");


const params =
    new URLSearchParams(
        window.location.search
    );


const swapRequestId =
    params.get("swapRequestId");

const receiverId =
    params.get("receiverId");

const receiverName =
    params.get("receiverName");


const rawUser =
    localStorage.getItem("loopwearUser");


let user = null;


try {

    user = rawUser
        ? JSON.parse(rawUser)
        : null;

} catch (error) {

    user = null;

}


// ========================================
// LOGIN CHECK
// ========================================

if (!user || !user.id) {

    window.location.href = "login.html";

}


// ========================================
// PARAMETER CHECK
// ========================================

if (
    !swapRequestId ||
    !receiverId
) {

    chatBox.innerHTML = `
        <div class="empty-chat">
            <h3>Chat unavailable</h3>
            <p>
                This conversation could not be identified.
            </p>
        </div>
    `;

    if (chatForm) {
        chatForm.style.display = "none";
    }

} else {

    chatSubtitle.textContent =
        `Negotiating with ${
            receiverName ||
            "LoopWear member"
        }`;

    markChatAsRead();

    loadSwapDetails();

    loadMessages();

}


// ========================================
// LOAD SWAP DETAILS
// ========================================

async function loadSwapDetails() {

    try {

        const response =
            await fetch(
                `${CHAT_API}/swap-requests/${encodeURIComponent(swapRequestId)}`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success ||
            !data.swapRequest
        ) {

            throw new Error(
                data.message ||
                "Unable to load swap details."
            );

        }


        const swap =
            data.swapRequest;


        const clothing =
            swap.clothing;


        // ========================================
        // DETERMINE OTHER USER
        // ========================================

        const otherUser =
            String(swap.requester?._id) ===
            String(user.id)
                ? swap.owner
                : swap.requester;


        const otherUserName =
            otherUser?.name ||
            receiverName ||
            "LoopWear member";


        // ========================================
        // CHAT HEADER
        // ========================================

        chatSubtitle.textContent =
            `Negotiating with ${otherUserName}`;


        if (chatAvatar) {

            chatAvatar.textContent =
                getInitials(otherUserName);

        }


        // ========================================
        // CLOTHING NAME
        // ========================================

        if (swapItemName) {

            swapItemName.textContent =
                clothing?.name ||
                "Clothing Exchange";

        }


        // ========================================
        // CLOTHING VALUE
        // ========================================

        if (swapItemValue) {

            const value =
                Number(
                    clothing?.swapValue
                );


            if (
                Number.isFinite(value)
            ) {

                swapItemValue.textContent =
                    `₹${value.toLocaleString("en-IN")}`;

            } else {

                swapItemValue.textContent =
                    "—";

            }

        }


        // ========================================
        // CLOTHING IMAGE
        // ========================================

        if (swapItemImage) {

            const image =
                clothing?.image;


            if (image) {

                swapItemImage.innerHTML = `
                    <img
                        src="${escapeChatHtml(image)}"
                        alt="${escapeChatHtml(
                            clothing?.name ||
                            "Swap clothing"
                        )}"
                    >
                `;

            } else {

                swapItemImage.innerHTML = `
                    <span
                        class="swap-item-placeholder"
                    >
                        👕
                    </span>
                `;

            }

        }


    } catch (error) {

        console.error(
            "Load swap details error:",
            error
        );

        // Keep the existing fallback UI.
        if (swapItemName) {
            swapItemName.textContent =
                "Clothing Exchange";
        }

        if (swapItemValue) {
            swapItemValue.textContent =
                "—";
        }

    }

}


// ========================================
// LOAD MESSAGES
// ========================================

async function loadMessages() {

    try {

        const response =
            await fetch(
                `${CHAT_API}/messages/${encodeURIComponent(swapRequestId)}`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load messages."
            );

        }


        renderMessages(
            data.messages || []
        );


    } catch (error) {

        console.error(
            "Load chat error:",
            error
        );


        chatBox.innerHTML = `
            <div class="empty-chat">

                <h3>
                    Unable to load chat
                </h3>

                <p>
                    Make sure the LoopWear backend
                    is running.
                </p>

            </div>
        `;

    }

}


// ========================================
// RENDER MESSAGES
// ========================================

function renderMessages(messages) {

    if (!messages.length) {

        chatBox.innerHTML = `
            <div class="empty-chat">

                <h3>
                    Start the conversation
                </h3>

                <p>
                    Discuss the clothing, condition,
                    swap value or handover details.
                </p>

            </div>
        `;

        return;

    }


    chatBox.innerHTML =
        messages.map(message => {

            const isMine =
                String(message.sender?._id) ===
                String(user.id);


            const senderName =
                isMine
                    ? "You"
                    : (
                        message.sender?.name ||
                        "LoopWear member"
                    );


            const createdAt =
                message.createdAt
                    ? new Date(message.createdAt)
                    : new Date();


            const time =
                createdAt.toLocaleTimeString(
                    [],
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );


            return `
                <div
                    class="message ${
                        isMine
                            ? "sent"
                            : "received"
                    }"
                >

                    <div class="message-name">
                        ${
                            escapeChatHtml(
                                senderName
                            )
                        }
                    </div>

                    <div>
                        ${
                            escapeChatHtml(
                                message.message
                            )
                        }
                    </div>

                    <div class="message-time">
                        ${time}
                    </div>

                </div>
            `;

        }).join("");


    chatBox.scrollTop =
        chatBox.scrollHeight;

}


// ========================================
// SEND MESSAGE
// ========================================

if (chatForm) {

    chatForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const message =
                messageInput.value.trim();


            if (!message) {
                return;
            }


            sendMessageBtn.disabled =
                true;


            sendMessageBtn.textContent = "…";

            try {

                const response =
                    await fetch(
                        `${CHAT_API}/messages`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                swapRequestId:
                                    swapRequestId,

                                senderId:
                                    user.id,

                                receiverId:
                                    receiverId,

                                message:
                                    message

                            })

                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to send message."
                    );

                }


                messageInput.value = "";


                await loadMessages();


            } catch (error) {

                console.error(
                    "Send message error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to send message."
                );


            } finally {

                sendMessageBtn.disabled =
                    false;


                // Keep the arrow icon.
                sendMessageBtn.textContent = "↑";

                messageInput.focus();

            }

        }
    );

}


// ========================================
// AUTO REFRESH CHAT
// ========================================

setInterval(
    function () {

        if (
            swapRequestId &&
            receiverId
        ) {

            loadMessages();

        }

    },
    3000
);


// ========================================
// MARK CHAT AS READ
// ========================================

async function markChatAsRead() {

    if (
        !swapRequestId ||
        !user ||
        !user.id
    ) {

        return;

    }


    try {

        await fetch(
            `${CHAT_API}/messages/read/${encodeURIComponent(swapRequestId)}/${encodeURIComponent(user.id)}`,
            {
                method: "PATCH"
            }
        );


    } catch (error) {

        console.error(
            "Mark chat as read error:",
            error
        );

    }

}


// ========================================
// GET INITIALS
// ========================================

function getInitials(name) {

    if (!name) {
        return "LW";
    }


    return name
        .trim()
        .split(/\s+/)
        .map(
            word =>
                word.charAt(0)
        )
        .join("")
        .substring(0, 2)
        .toUpperCase();

}


// ========================================
// HTML ESCAPE
// ========================================

function escapeChatHtml(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}