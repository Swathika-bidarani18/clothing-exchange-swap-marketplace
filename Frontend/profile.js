document.addEventListener("DOMContentLoaded", function () {

    const rawUser =
        localStorage.getItem("loopwearUser");

    // ========================================
    // LOGIN CHECK
    // ========================================

    if (!rawUser) {

        window.location.href = "login.html";

        return;
    }


    let user;

    try {

        user = JSON.parse(rawUser);

    } catch (error) {

        console.error(
            "Unable to read logged-in user:",
            error
        );

        localStorage.removeItem("loopwearUser");

        window.location.href = "login.html";

        return;
    }


    // ========================================
    // GET PROFILE ELEMENTS
    // ========================================

    const profileName =
        document.getElementById("profileName");

    const profileEmail =
        document.getElementById("profileEmail");

    const profileLocation =
        document.getElementById("profileLocation");

    const profileRole =
        document.getElementById("profileRole");

    const profileAvatar =
        document.getElementById("profileAvatar");


    // ========================================
    // DISPLAY USER INFORMATION
    // ========================================

    profileName.textContent =
        user.name || "Not available";

    profileEmail.textContent =
        user.email || "Not available";

    profileLocation.textContent =
        user.location || "Not available";


    // ========================================
    // ACCOUNT ROLE
    // ========================================

    if (user.role === "admin") {

        profileRole.textContent =
            "Administrator";

    } else {

        profileRole.textContent =
            "Member";
    }


    // ========================================
    // AVATAR INITIALS
    // ========================================

    if (user.name) {

        const initials =
            user.name
                .trim()
                .split(/\s+/)
                .map(word => word.charAt(0))
                .join("")
                .substring(0, 2)
                .toUpperCase();

        profileAvatar.textContent =
            initials || "LW";
    }


    // ========================================
    // LOGOUT
    // ========================================

    function logout() {

        localStorage.removeItem("loopwearUser");

        window.location.href =
            "index.html";
    }


    const logoutBtn =
        document.getElementById("logoutBtn");

    const profileLogoutBtn =
        document.getElementById(
            "profileLogoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                logout();
            }
        );
    }


    if (profileLogoutBtn) {

        profileLogoutBtn.addEventListener(
            "click",
            logout
        );
    }

});