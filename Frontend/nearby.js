const NEARBY_API = window.LOOPWEAR_API;

const nearbyItems =
    document.getElementById("nearbyItems");

const nearbyLocation =
    document.getElementById("nearbyLocation");

const nearbyDescription =
    document.getElementById("nearbyDescription");


function getLoggedInUser() {

    const rawUser =
        localStorage.getItem("loopwearUser");

    if (!rawUser) {
        return null;
    }

    try {
        return JSON.parse(rawUser);
    } catch (error) {
        console.error(
            "Unable to read logged-in user:",
            error
        );

        return null;
    }
}


async function loadNearbyClothing() {

    const user = getLoggedInUser();

    // User is not logged in
    if (!user || !user.location) {

        nearbyLocation.textContent =
            "Log in to discover nearby swaps.";

        nearbyDescription.textContent =
            "Sign in to LoopWear and discover clothing available around your area.";

        nearbyItems.innerHTML = `
            <div class="nearby-empty">
                <div class="nearby-empty-icon">⌖</div>

                <h3>
                    Find your nearby loops
                </h3>

                <p>
                    Log in to see clothing
                    available around your location.
                </p>

                <a
                    href="login.html"
                    class="nearby-login-btn"
                >
                    Login →
                </a>
            </div>
        `;

        return;
    }


    const location =
        user.location.trim();


    nearbyLocation.textContent =
        `Showing loops near ${location}`;


    try {

        const response =
            await fetch(
                `${NEARBY_API}/clothing/nearby?location=${encodeURIComponent(location)}`
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load nearby clothing."
            );

        }


        renderNearbyClothing(
            data.clothing || [],
            user
        );


    } catch (error) {

        console.error(
            "Nearby clothing error:",
            error
        );


        nearbyItems.innerHTML = `
            <div class="nearby-empty">

                <div class="nearby-empty-icon">
                    !
                </div>

                <h3>
                    Nearby loops unavailable
                </h3>

                <p>
                    Make sure the LoopWear
                    backend is running.
                </p>

            </div>
        `;

    }
}


function renderNearbyClothing(
    clothing,
    user
) {

    if (!clothing.length) {

        nearbyItems.innerHTML = `
            <div class="nearby-empty">

                <div class="nearby-empty-icon">
                    ⌖
                </div>

                <h3>
                    No nearby clothing yet
                </h3>

                <p>
                    There are currently no
                    clothing listings in
                    ${escapeNearbyHtml(user.location)}.
                </p>

                <a
                    href="add-clothing.html"
                    class="nearby-login-btn"
                >
                    Add Clothing →
                </a>

            </div>
        `;

        return;
    }


    nearbyItems.innerHTML =
        clothing
            .slice(0, 4)
            .map(item => {

                const isOwnItem =
                    String(item.owner?._id) ===
                    String(user.id);


                return `
                    <article
                        class="nearby-item-card"
                    >

                        <div class="nearby-item-image">

                            <img
                                src="${escapeNearbyHtml(item.image)}"
                                alt="${escapeNearbyHtml(item.name)}"
                            >

                        </div>


                        <div class="nearby-item-info">

                            <span class="nearby-item-category">
                                ${escapeNearbyHtml(item.category)}
                            </span>

                            <h3>
                                ${escapeNearbyHtml(item.name)}
                            </h3>

                            <p>
                                ${escapeNearbyHtml(item.brand || "Not specified")}
                                ·
                                ${escapeNearbyHtml(item.size)}
                            </p>

                            <div class="nearby-item-bottom">

                                <strong>
                                    ₹${Number(item.swapValue || 0)}
                                </strong>

                                <span>
                                    ${escapeNearbyHtml(item.location)}
                                </span>

                            </div>

                            ${
                                isOwnItem
                                    ? `
                                        <a
            href="item-details.html?itemId=${encodeURIComponent(item._id)}"
            class="nearby-view-btn"
        >
            Your Listing →
        </a>
                                      `
                                    : `
                                        <a
                                            href="item-details.html?itemId=${encodeURIComponent(item._id)}"
                                            class="nearby-view-btn"
                                        >
                                            View Item →
                                        </a>
                                      `
                            }

                        </div>

                    </article>
                `;

            })
            .join("");
}


function escapeNearbyHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


loadNearbyClothing();