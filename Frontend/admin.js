// ========================================
// LOOPWEAR ADMIN PANEL
// ========================================

const ADMIN_API =
    window.LOOPWEAR_API;


// ========================================
// GET LOGGED-IN USER
// ========================================

const rawUser =
    localStorage.getItem("loopwearUser");

let adminUser = null;

try {

    adminUser =
        rawUser
            ? JSON.parse(rawUser)
            : null;

} catch (error) {

    adminUser = null;

}


// ========================================
// ADMIN ACCESS CHECK
// ========================================

if (
    !adminUser ||
    !adminUser.id
) {

    window.location.href =
        "login.html";

}


// Check role

if (
    adminUser &&
    adminUser.role !== "admin"
) {

    document.getElementById(
        "adminContent"
    ).innerHTML = `

        <div class="access-denied">

            <h1>
                Access Denied
            </h1>

            <p>
                This page is available only
                to LoopWear administrators.
            </p>

            <a
                href="dashboard.html"
                class="back-btn"
            >
                Back to Dashboard
            </a>

        </div>

    `;

    throw new Error(
        "Admin access denied."
    );

}


// ========================================
// COMMON FETCH
// ========================================

async function adminFetch(
    endpoint,
    options = {}
) {

    const headers = {

        "Content-Type":
            "application/json",

        "x-user-id":
            adminUser.id,

        ...(options.headers || {})

    };


    const response =
        await fetch(
            `${ADMIN_API}${endpoint}`,
            {
                ...options,
                headers
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Admin request failed."
        );

    }


    return data;

}


// ========================================
// LOAD STATISTICS
// ========================================

async function loadStats() {

    try {

        const data =
            await adminFetch(
                "/admin/stats"
            );


        const stats =
            data.stats;


        document.getElementById(
            "totalUsers"
        ).textContent =
            stats.totalUsers;


        document.getElementById(
            "totalClothing"
        ).textContent =
            stats.totalClothing;


        document.getElementById(
            "totalSwaps"
        ).textContent =
            stats.totalSwaps;


        document.getElementById(
            "successfulSwaps"
        ).textContent =
            stats.successfulSwaps;


        document.getElementById(
            "totalMessages"
        ).textContent =
            stats.totalMessages;


    } catch (error) {

        console.error(
            "Stats error:",
            error
        );

    }

}


// ========================================
// LOAD USERS
// ========================================

async function loadUsers() {

    const loading =
        document.getElementById(
            "usersLoading"
        );

    const table =
        document.getElementById(
            "usersTable"
        );


    loading.style.display =
        "block";


    try {

        const data =
            await adminFetch(
                "/admin/users"
            );


        table.innerHTML = "";


        if (!data.users.length) {

            table.innerHTML = `

                <tr>
                    <td
                        colspan="5"
                        class="empty"
                    >
                        No users found.
                    </td>
                </tr>

            `;

            return;

        }


        data.users.forEach(
            function (user) {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            user.name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            user.email
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            user.location
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            user.role || "user"
                        )}
                    </td>

                    <td>

                        ${
                            user.id ===
                            adminUser.id

                            ? `<span
                                class="status"
                            >
                                Current Admin
                              </span>`

                            : `<button
                                class="delete-btn"
                                onclick="deleteUser('${user._id}')"
                              >
                                Delete
                              </button>`
                        }

                    </td>

                `;


                table.appendChild(row);

            }
        );


    } catch (error) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty"
                >
                    Unable to load users.
                </td>

            </tr>

        `;

        console.error(
            "Users error:",
            error
        );

    } finally {

        loading.style.display =
            "none";

    }

}


// ========================================
// DELETE USER
// ========================================

async function deleteUser(
    userId
) {

    const confirmed =
        confirm(
            "Delete this user? This action cannot be undone."
        );


    if (!confirmed) {
        return;
    }


    try {

        await adminFetch(
            `/admin/users/${encodeURIComponent(userId)}`,
            {
                method: "DELETE"
            }
        );


        alert(
            "User deleted successfully."
        );


        await loadUsers();
        await loadStats();


    } catch (error) {

        alert(
            error.message
        );

    }

}


// ========================================
// LOAD CLOTHING
// ========================================

async function loadClothing() {

    const loading =
        document.getElementById(
            "clothingLoading"
        );

    const table =
        document.getElementById(
            "clothingTable"
        );


    loading.style.display =
        "block";


    try {

        const data =
            await adminFetch(
                "/admin/clothing"
            );


        table.innerHTML = "";


        if (!data.clothing.length) {

            table.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="empty"
                    >
                        No clothing listings found.
                    </td>

                </tr>

            `;

            return;

        }


        data.clothing.forEach(
            function (item) {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            item.name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.category
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.brand ||
                            "Not specified"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.condition
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.location
                        )}
                    </td>

                    <td>
                        ₹${Number(
                            item.swapValue || 0
                        ).toLocaleString("en-IN")}
                    </td>

                    <td>

                        <button
                            class="delete-btn"
                            onclick="deleteClothing('${item._id}')"
                        >
                            Remove
                        </button>

                    </td>

                `;


                table.appendChild(row);

            }
        );


    } catch (error) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty"
                >
                    Unable to load listings.
                </td>

            </tr>

        `;

        console.error(
            "Clothing error:",
            error
        );

    } finally {

        loading.style.display =
            "none";

    }

}


// ========================================
// DELETE CLOTHING
// ========================================

async function deleteClothing(
    clothingId
) {

    const confirmed =
        confirm(
            "Remove this clothing listing?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await adminFetch(
            `/admin/clothing/${encodeURIComponent(clothingId)}`,
            {
                method: "DELETE"
            }
        );


        alert(
            "Clothing listing removed."
        );


        await loadClothing();
        await loadStats();


    } catch (error) {

        alert(
            error.message
        );

    }

}


// ========================================
// LOAD SWAPS
// ========================================

async function loadSwaps() {

    const loading =
        document.getElementById(
            "swapsLoading"
        );

    const table =
        document.getElementById(
            "swapsTable"
        );


    loading.style.display =
        "block";


    try {

        const data =
            await adminFetch(
                "/admin/swaps"
            );


        table.innerHTML = "";


        if (!data.swaps.length) {

            table.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        class="empty"
                    >
                        No swap requests found.
                    </td>

                </tr>

            `;

            return;

        }


        data.swaps.forEach(
            function (swap) {

                const row =
                    document.createElement(
                        "tr"
                    );


                const requester =
                    swap.requester
                        ? swap.requester.name
                        : "Unknown";


                const owner =
                    swap.owner
                        ? swap.owner.name
                        : "Unknown";


                const requestedItem =
                    swap.clothing
                        ? swap.clothing.name
                        : "Unknown";


                const offeredItem =
                    swap.offeredClothing
                        ? swap.offeredClothing.name
                        : "None";


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            requester
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            owner
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            requestedItem
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            offeredItem
                        )}
                    </td>

                    <td>

                        <span class="status">

                            ${escapeHtml(
                                swap.status
                            )}

                        </span>

                    </td>

                `;


                table.appendChild(row);

            }
        );


    } catch (error) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty"
                >
                    Unable to load swaps.
                </td>

            </tr>

        `;

        console.error(
            "Swaps error:",
            error
        );

    } finally {

        loading.style.display =
            "none";

    }

}


// ========================================
// HTML ESCAPE
// ========================================

function escapeHtml(value) {

    return String(
        value ?? ""
    )
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


// ========================================
// INITIAL LOAD
// ========================================

loadStats();
loadUsers();
loadClothing();
loadSwaps();