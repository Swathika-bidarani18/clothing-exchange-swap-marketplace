// ========================================
// LOOPWEAR - CLOTHING EXCHANGE MARKETPLACE
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Welcome to LoopWear!");
    console.log("Swap. Reuse. Repeat.");
    // ========================================
// ITEM DETAILS PAGE
// ========================================

const itemDetailsImage =
    document.getElementById("itemDetailsImage");

const itemName =
    document.getElementById("itemName");

if (itemDetailsImage && itemName) {

    const urlParams = new URLSearchParams(window.location.search);

const itemId =
    urlParams.get("itemId") ||
    urlParams.get("id");

const itemNumber =
    urlParams.get("item");

    // ========================================
    // HOME PAGE STATIC ITEMS
    // ========================================

    const homeItems = {

        "1": {
            name: "Classic White T-Shirt",
            image: "images/white T-Shirt.jpg",
            size: "M",
            condition: "Good Condition",
            category: "T-Shirts",
            brand: "Not specified",
            location: "Hyderabad",
            swapValue: "350"
        },

        "2": {
            name: "Floral Summer Dress",
            image: "images/Floral summer dress.jpg",
            size: "S",
            condition: "Like New",
            category: "Dresses",
            brand: "Not specified",
            location: "Secunderabad",
            swapValue: "650"
        },

        "3": {
            name: "Everyday Denim Jeans",
            image: "images/Denim jeans.jpg",
            size: "30",
            condition: "Good Condition",
            category: "Jeans",
            brand: "Not specified",
            location: "Uppal",
            swapValue: "700"
        },

        "4": {
            name: "Minimal White Sneakers",
            image: "images/White sneakers.jpg",
            size: "7",
            condition: "Like New",
            category: "Shoes",
            brand: "Not specified",
            location: "LB Nagar",
            swapValue: "900"
        },

        "5": {
            name: "Black Casual Shirt",
            image: "images/Blacl casual shirt.jpg",
            size: "L",
            condition: "Good Condition",
            category: "Shirts",
            brand: "Not specified",
            location: "Malakpet",
            swapValue: "500"
        },

        "6": {
            name: "Party Wear Dress",
            image: "images/Party wear dresses.jpg",
            size: "M",
            condition: "Like New",
            category: "Dresses",
            brand: "Not specified",
            location: "Attapur",
            swapValue: "850"
        }
    };


    // ========================================
    // DISPLAY ITEM
    // ========================================

    function displayItem(item) {

        itemDetailsImage.src =
            item.image;

        itemDetailsImage.alt =
            item.name;

        itemDetailsImage.style.display =
            "block";

        itemName.textContent =
            item.name;

        document.getElementById("itemSize").textContent =
            item.size;

        document.getElementById("itemCondition").textContent =
            item.condition;

        document.getElementById("itemCategory").textContent =
            item.category;

        document.getElementById("itemBrand").textContent =
            item.brand ||
            "Not specified";

        document.getElementById("itemLocation").textContent =
            item.location;

        document.getElementById("itemValue").textContent =
            item.swapValue;
    }


    // ========================================
    // LOAD ITEM DETAILS
    // ========================================

    async function loadItemDetails() {

        // ------------------------------------
        // OPTION 1: ITEM FROM MY CLOTHES
        // ------------------------------------

        if (itemId) {

            try {

                const response =
                    await fetch(
                        `${window.LOOPWEAR_API}/clothing`
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to load item."
                    );
                }

                const selectedItem =
                    data.clothing.find(function (item) {

                        return item._id === itemId;

                    });


                if (!selectedItem) {

                    itemName.textContent =
                        "Item Not Found";

                    itemDetailsImage.style.display =
                        "none";

                    return;
                }


                displayItem({
                    name: selectedItem.name,
                    image: selectedItem.image,
                    size: selectedItem.size,
                    condition: selectedItem.condition,
                    category: selectedItem.category,
                    brand: selectedItem.brand,
                    location: selectedItem.location,
                    swapValue: selectedItem.swapValue
                });


            } catch (error) {

                console.error(
                    "Item Details error:",
                    error
                );

                itemName.textContent =
                    "Unable to load item.";

                itemDetailsImage.style.display =
                    "none";
            }

            return;
        }


        // ------------------------------------
        // OPTION 2: HOME PAGE ITEM
        // ------------------------------------

        if (itemNumber) {

            const selectedHomeItem =
                homeItems[itemNumber];


            if (!selectedHomeItem) {

                itemName.textContent =
                    "Item Not Found";

                itemDetailsImage.style.display =
                    "none";

                return;
            }


            displayItem(
                selectedHomeItem
            );

            return;
        }


        // ------------------------------------
        // NO ITEM ID
        // ------------------------------------

        itemName.textContent =
            "Item Not Found";

        itemDetailsImage.style.display =
            "none";
    }


    loadItemDetails();
}

    // ========================================
    // NAVIGATION
    // ========================================

    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const linkText = link.textContent.trim();

            if (link.getAttribute("href") === "#") {
                event.preventDefault();
            }

            if (linkText === "Browse Clothes") {

                document.getElementById("browse").scrollIntoView({
                    behavior: "smooth"
                });

            }

            else if (linkText === "How It Works") {

    event.preventDefault();

    const howItWorksSection =
        document.getElementById("how-it-works");

    if (howItWorksSection) {
        howItWorksSection.scrollIntoView({
            behavior: "smooth"
        });
    }

}


        });

    });


    // ========================================
// BROWSE CLOTHES - LOAD FROM MONGODB
// ========================================

const clothingGrid = document.getElementById("clothingGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const noResults = document.getElementById("noResults");
const browseCount = document.getElementById("browseCount");

let allClothing = [];


// ========================================
// LOAD CLOTHING FROM BACKEND
// ========================================

async function loadClothing() {

    if (!clothingGrid) {
        return;
    }

    try {

        const response = await fetch(
            `${window.LOOPWEAR_API}/clothing`
        );

        const data = await response.json();

        if (!data.success) {

            clothingGrid.innerHTML = "";

            noResults.style.display = "block";
            noResults.textContent =
                "Unable to load clothing items.";

            return;
        }

        allClothing = data.clothing || [];

        displayClothing(allClothing);

    } catch (error) {

        console.error(
            "Error loading clothing:",
            error
        );

        clothingGrid.innerHTML = "";

        noResults.style.display = "block";

        noResults.textContent =
            "Unable to connect to the server. Please start the backend.";
    }
}


// ========================================
// DISPLAY CLOTHING CARDS
// ========================================

function displayClothing(clothingItems) {

    clothingGrid.innerHTML = "";

    if (clothingItems.length === 0) {

        noResults.style.display = "block";

        if (browseCount) {
            browseCount.textContent = "0 pieces currently moving";
        }

        return;
    }

    noResults.style.display = "none";

    clothingItems.forEach(function (item) {

        const card = document.createElement("article");

        card.className = "clothing-card";

        card.dataset.name =
            item.name || "";

        card.dataset.category =
            item.category || "";


        // --------------------------------
        // Image
        // --------------------------------

        const imageLink =
            document.createElement("a");

        imageLink.className =
            "clothing-image";

        imageLink.href =
            "item-details.html?itemId=" + item._id;


        const image =
            document.createElement("img");

        image.src =
            item.image;

        image.alt =
            item.name || "Clothing item";


        const conditionTag =
            document.createElement("span");

        conditionTag.className =
            "condition-tag";

        conditionTag.textContent =
            (item.condition || "GOOD CONDITION")
                .toUpperCase();


        imageLink.appendChild(image);
        imageLink.appendChild(conditionTag);


        // --------------------------------
        // Clothing Information
        // --------------------------------

        const clothingInfo =
            document.createElement("div");

        clothingInfo.className =
            "clothing-info";


        const infoText =
            document.createElement("div");


        const category =
            document.createElement("p");

        category.className =
            "item-category";

        category.textContent =
            (item.category || "CLOTHING")
                .toUpperCase();


        const name =
            document.createElement("h3");

        name.textContent =
            item.name || "Unnamed Item";


        infoText.appendChild(category);
        infoText.appendChild(name);


        const value =
            document.createElement("span");

        value.className =
            "item-value";

        value.textContent =
            "₹" + (item.swapValue || 0);


        clothingInfo.appendChild(infoText);
        clothingInfo.appendChild(value);


        // --------------------------------
        // Item Meta
        // --------------------------------

        const meta =
            document.createElement("div");

        meta.className =
            "item-meta";


        const size =
            document.createElement("span");

        size.textContent =
            "Size " + (item.size || "N/A");


        const location =
            document.createElement("span");

        location.textContent =
            item.location || "Location unavailable";


        meta.appendChild(size);
        meta.appendChild(location);


        // --------------------------------
        // Build Card
        // --------------------------------

        card.appendChild(imageLink);
        card.appendChild(clothingInfo);
        card.appendChild(meta);

        clothingGrid.appendChild(card);

    });


    if (browseCount) {

        browseCount.textContent =
            clothingItems.length +
            (
                clothingItems.length === 1
                    ? " piece currently moving"
                    : " pieces currently moving"
            );
    }
}


// ========================================
// SEARCH + CATEGORY FILTER
// ========================================

function filterClothes() {

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();

    const selectedCategory =
        categoryFilter.value
            .toLowerCase();


    const filteredItems =
        allClothing.filter(function (item) {

            const itemName =
                (item.name || "")
                    .toLowerCase();

            const itemCategory =
                (item.category || "")
                    .toLowerCase();


            const matchesSearch =
                itemName.includes(searchText);


            const matchesCategory =
                selectedCategory === "all" ||
                itemCategory === selectedCategory;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    displayClothing(filteredItems);
}


if (searchInput && categoryFilter) {

    searchInput.addEventListener(
        "input",
        filterClothes
    );

    categoryFilter.addEventListener(
        "change",
        filterClothes
    );
}


// ========================================
// LOAD BROWSE CLOTHES
// ========================================

loadClothing();


    // ========================================
    // CATEGORY CARDS
    // ========================================

    const categories =
        document.querySelectorAll(
            "main > section:nth-child(3) div"
        );


    categories.forEach(function (category) {

        category.addEventListener("click", function () {

            const categoryName =
                category.querySelector("h3").textContent;


            const categoryValue =
                categoryName.toLowerCase();


            categoryFilter.value = categoryValue;

            filterClothes();


            document.getElementById("browse").scrollIntoView({
                behavior: "smooth"
            });

        });

    });

    // ========================================
    // HERO BUTTONS
    // ========================================

    const heroLinks =
    document.querySelectorAll(
        ".hero-section a"
    );

    heroLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            event.preventDefault();


            const buttonText =
                link.textContent.trim();


            if (buttonText === "Start Swapping") {

                document.getElementById("browse").scrollIntoView({
                    behavior: "smooth"
                });

            }


            else if (buttonText === "Browse Clothes") {

                document.getElementById("browse").scrollIntoView({
                    behavior: "smooth"
                });

            }

        });

    });


    console.log("Marketplace loaded successfully.");

});
// ===============================
// REGISTER USER
// ===============================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                document.getElementById("name").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value;

            const location =
                document.getElementById("location").value.trim();


            try {

                const response =
                    await fetch(
                        `${window.LOOPWEAR_API}/users/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                name: name,
                                email: email,
                                password: password,
                                location: location
                            })
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

    const message =
        document.getElementById("registerMessage");

    message.textContent =
        "✓ Account created successfully!";

    message.style.display = "block";

    setTimeout(function () {

        window.location.href = "login.html";

    }, 1500);

                } else {

    const message =
        document.getElementById(
            "registerMessage"
        );

    if (message) {

        if (
            Array.isArray(data.errors) &&
            data.errors.length > 0
        ) {

            message.innerHTML = `
                <strong>${data.message || "Please correct the following:"}</strong>
                <ul>
                    ${data.errors
                        .map(error => `<li>${error}</li>`)
                        .join("")}
                </ul>
            `;

        } else {

            message.textContent =
                data.message ||
                "Registration failed.";
        }

        message.style.display = "block";

    } else {

        alert(
            data.errors
                ? data.errors.join("\n")
                : (
                    data.message ||
                    "Registration failed."
                )
        );
    }
}


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );

                alert(
                    "Unable to connect to LoopWear server. Make sure the backend is running."
                );
            }

        }
    );
}
// ===============================
// LOGIN USER
// ===============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {
            const response = await fetch(`${window.LOOPWEAR_API}/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
    // Save logged-in user information
    localStorage.setItem("loopwearUser", JSON.stringify(data.user));

    // Show success message in the center
    const successMessage = document.createElement("div");

    successMessage.innerText = "Login successful!";

    successMessage.style.position = "fixed";
    successMessage.style.top = "50%";
    successMessage.style.left = "50%";
    successMessage.style.transform = "translate(-50%, -50%)";
    successMessage.style.background = "#ffffff";
    successMessage.style.padding = "20px 35px";
    successMessage.style.borderRadius = "12px";
    successMessage.style.boxShadow = "0 5px 25px rgba(0, 0, 0, 0.2)";
    successMessage.style.fontSize = "20px";
    successMessage.style.fontWeight = "600";
    successMessage.style.zIndex = "9999";

    document.body.appendChild(successMessage);

    // Automatically go to dashboard after 1.5 seconds
    setTimeout(function () {
        window.location.href = "dashboard.html";
    }, 1500);
    } else {
                alert(data.message);
            }

        } catch (error) {
            console.error("Login error:", error);
            alert("Unable to connect to the server.");
        }
    });
}
// ========================================
// ========================================
// ADD CLOTHING PAGE
// ========================================

const addClothingForm = document.getElementById("addClothingForm");

if (addClothingForm) {

    addClothingForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const message =
            document.getElementById("addClothingMessage");

        // Check logged-in user
        const userData =
            localStorage.getItem("loopwearUser");

        if (!userData) {

            message.textContent =
                "Please login before adding clothing.";

            message.style.color = "red";

            setTimeout(function () {
                window.location.href = "login.html";
            }, 1500);

            return;
        }

        const loggedInUser = JSON.parse(userData);

        // Collect form data
        const clothingData = {

            name:
                document.getElementById("clothingName").value.trim(),

            image:
                document.getElementById("clothingImage").value.trim(),

            size:
                document.getElementById("clothingSize").value,

            condition:
                document.getElementById("clothingCondition").value,

            category:
                document.getElementById("clothingCategory").value,

            brand:
                document.getElementById("clothingBrand").value.trim(),

            location:
                document.getElementById("clothingLocation").value.trim(),

            swapValue:
                Number(
                    document.getElementById("clothingValue").value
                ),

            owner: loggedInUser.id
        };

        try {

            message.textContent =
                "Adding your clothing to the loop...";

            message.style.color = "var(--ink)";

            const response = await fetch(
                `${window.LOOPWEAR_API}/clothing`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(clothingData)
                }
            );

            const data = await response.json();

            if (response.ok) {

                message.textContent =
                    "✓ Clothing added to your Loop!";

                message.style.color = "green";

                addClothingForm.reset();

            } else {

    if (
        Array.isArray(data.errors) &&
        data.errors.length > 0
    ) {
        message.innerHTML = `
            <strong>${data.message || "Please correct the following:"}</strong>
            <ul>
                ${data.errors
                    .map(error => `<li>${error}</li>`)
                    .join("")}
            </ul>
        `;
    } else {
        message.textContent =
            data.message ||
            "Unable to add clothing.";
    }

    message.style.color = "red";
}
        } catch (error) {

            console.error(
                "Add clothing error:",
                error
            );

            message.textContent =
                "Unable to connect to LoopWear server.";

            message.style.color = "red";
        }

    });

}
// ========================================
// MY CLOTHES PAGE
// ========================================

const myClothesGrid =
    document.getElementById("myClothesGrid");

const emptyClothesState =
    document.getElementById("emptyClothesState");

const myClothesUserName =
    document.getElementById("myClothesUserName");

if (myClothesGrid) {

    async function loadMyClothes() {

        const userData =
            localStorage.getItem("loopwearUser");

        if (!userData) {
            window.location.href = "login.html";
            return;
        }

        const loggedInUser =
            JSON.parse(userData);

        if (myClothesUserName) {
            myClothesUserName.textContent =
                loggedInUser.name;
        }

        try {

            const response = await fetch(
                `${window.LOOPWEAR_API}/clothing`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to load clothing."
                );
            }

            const myClothes =
                data.clothing.filter(function (item) {

                    if (!item.owner) {
                        return false;
                    }

                    const ownerId =
                        item.owner._id ||
                        item.owner.id ||
                        item.owner;

                    return String(ownerId) ===
                        String(loggedInUser.id);
                });

            myClothesGrid.innerHTML = "";

            if (myClothes.length === 0) {

                emptyClothesState.style.display =
                    "flex";

                return;
            }

            emptyClothesState.style.display =
                "none";

            myClothes.forEach(function (item) {

                const card =
                    document.createElement("article");

                card.className =
                    "my-clothing-card";

                card.innerHTML = `

                    <div class="my-clothing-image">
                        <img
                            src="${item.image}"
                            alt="${item.name}"
                        >
                    </div>

                    <div class="my-clothing-information">

                        <p class="my-clothing-category">
                            ${item.category}
                        </p>

                        <h2>
                            ${item.name}
                        </h2>

                        <div class="my-clothing-details">

                            <p>
                                <strong>Size</strong>
                                <span>${item.size}</span>
                            </p>

                            <p>
                                <strong>Condition</strong>
                                <span>${item.condition}</span>
                            </p>

                            <p>
                                <strong>Brand</strong>
                                <span>
                                    ${item.brand || "Not specified"}
                                </span>
                            </p>

                            <p>
                                <strong>Location</strong>
                                <span>${item.location}</span>
                            </p>

                        </div>

                        <div class="my-clothing-value">

                            <span>
                                Loop Value
                            </span>

                            <span>
                                ₹${item.swapValue}
                            </span>

                        </div>

                        <div class="my-clothing-actions">

    <a
        href="item-details.html?itemId=${item._id}"
        class="my-clothing-view"
    >
        View Item →
    </a>

    <button
        type="button"
        class="my-clothing-edit"
        data-id="${item._id}"
    >
        Edit
    </button>

    <button
        type="button"
        class="my-clothing-delete"
        data-id="${item._id}"
    >
        Delete
    </button>

</div>
                `;
                                const editButton =
                    card.querySelector(".my-clothing-edit");

                const deleteButton =
                    card.querySelector(".my-clothing-delete");


                // EDIT
                editButton.addEventListener("click", function () {

                    window.location.href =
                        `edit-clothing.html?itemId=${item._id}`;

                });


                // DELETE
                deleteButton.addEventListener("click", function () {
                    showDeleteModal(item, async function () {
                        const userData = localStorage.getItem("loopwearUser");

                        if (!userData) {
                            alert("Please login again.");
                            return;
                        }

                        const loggedInUser = JSON.parse(userData);

                        try {
                            const response = await fetch(
                                `${window.LOOPWEAR_API}/clothing/${item._id}`,
                                {
                                    method: "DELETE",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        owner: loggedInUser.id
                                    })
                                }
                            );

                            const data = await response.json();

                            if (response.ok) {
                                loadMyClothes();
                            } else {
                                alert(
                                    data.message ||
                                    "Unable to delete clothing."
                                );
                            }
                        } catch (error) {
                            console.error("Delete clothing error:", error);
                            alert("Unable to connect to LoopWear server.");
                        }
                    });
                });

                myClothesGrid.appendChild(card);


            });

        } catch (error) {

            console.error(
                "My Clothes error:",
                error
            );

            myClothesGrid.innerHTML = `
                <div style="
                    grid-column: 1 / -1;
                    padding: 40px;
                    text-align: center;
                ">
                    <h2>
                        Unable to load your clothes.
                    </h2>

                    <p>
                        Please make sure the LoopWear
                        server is running.
                    </p>
                </div>
            `;
        }
    }

    // ========================================
    // DELETE CONFIRMATION MODAL
    // ========================================

    function showDeleteModal(item, onConfirm) {

        const existingModal =
            document.getElementById("loopDeleteModal");

        if (existingModal) {
            existingModal.remove();
        }

        const modal =
            document.createElement("div");

        modal.id = "loopDeleteModal";

        if (!document.getElementById("loopDeleteModalStyles")) {
            const style = document.createElement("style");
            style.id = "loopDeleteModalStyles";
            style.textContent = `
                .loop-delete-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(20, 20, 20, 0.55);
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    z-index: 99999;
                }

                .loop-delete-modal {
                    width: min(420px, 100%);
                    box-sizing: border-box;
                    background: #f8f5ed;
                    border: 1px solid rgba(0, 0, 0, 0.12);
                    border-radius: 24px;
                    padding: 34px 30px 28px;
                    text-align: center;
                    position: relative;
                    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.25);
                    animation: loopModalIn 0.2s ease-out;
                }

                @keyframes loopModalIn {
                    from {
                        opacity: 0;
                        transform: translateY(12px) scale(0.97);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .loop-delete-close {
                    position: absolute;
                    top: 12px;
                    right: 14px;
                    width: 36px;
                    height: 36px;
                    border: 0;
                    border-radius: 50%;
                    background: transparent;
                    color: #555;
                    font-size: 28px;
                    line-height: 1;
                    cursor: pointer;
                }

                .loop-delete-close:hover {
                    background: rgba(0, 0, 0, 0.07);
                }

                .loop-delete-icon {
                    width: 58px;
                    height: 58px;
                    margin: 0 auto 16px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #fff0ed;
                    color: #b44a38;
                    border: 1px solid #efc9c0;
                    font-size: 25px;
                    font-weight: 700;
                }

                .loop-delete-label {
                    margin: 0 0 8px;
                    font-size: 11px;
                    letter-spacing: 0.16em;
                    font-weight: 700;
                    color: #777;
                }

                .loop-delete-modal h2 {
                    margin: 0;
                    color: #222;
                    font-size: 24px;
                    line-height: 1.2;
                }

                .loop-delete-item {
                    margin: 10px 0 6px;
                    color: #222;
                    font-size: 16px;
                    font-weight: 700;
                }

                .loop-delete-message {
                    margin: 0 auto 24px;
                    max-width: 320px;
                    color: #777;
                    font-size: 14px;
                    line-height: 1.5;
                }

                .loop-delete-actions {
                    display: flex;
                    gap: 10px;
                }

                .loop-delete-actions button {
                    flex: 1;
                    min-height: 46px;
                    border-radius: 12px;
                    padding: 0 16px;
                    font: inherit;
                    font-weight: 700;
                    cursor: pointer;
                    transition: 0.2s ease;
                }

                .loop-delete-cancel {
                    background: #fff;
                    color: #222;
                    border: 1px solid #d6d1c7;
                }

                .loop-delete-cancel:hover {
                    background: #f1eee7;
                }

                .loop-delete-confirm {
                    background: #222;
                    color: #fff;
                    border: 1px solid #222;
                }

                .loop-delete-confirm:hover {
                    background: #000;
                    transform: translateY(-1px);
                }

                .loop-delete-confirm:disabled {
                    opacity: 0.6;
                    cursor: wait;
                    transform: none;
                }

                @media (max-width: 480px) {
                    .loop-delete-modal {
                        padding: 30px 20px 22px;
                    }

                    .loop-delete-modal h2 {
                        font-size: 21px;
                    }

                    .loop-delete-actions {
                        flex-direction: column;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        modal.innerHTML = `
            <div class="loop-delete-overlay">
                <div class="loop-delete-modal">

                    <button
                        class="loop-delete-close"
                        type="button"
                        aria-label="Close"
                    >
                        ×
                    </button>

                    <div class="loop-delete-icon">
                        !
                    </div>

                    <p class="loop-delete-label">
                        REMOVE FROM LOOP
                    </p>

                    <h2>
                        Delete this clothing?
                    </h2>

                    <p class="loop-delete-item">
                        ${item.name}
                    </p>

                    <p class="loop-delete-message">
                        This item will be permanently removed
                        from your wardrobe.
                    </p>

                    <div class="loop-delete-actions">

                        <button
                            type="button"
                            class="loop-delete-cancel"
                        >
                            Keep Item
                        </button>

                        <button
                            type="button"
                            class="loop-delete-confirm"
                        >
                            Delete Item
                        </button>

                    </div>

                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = function () {
            modal.remove();
        };

        modal
            .querySelector(".loop-delete-close")
            .addEventListener("click", closeModal);

        modal
            .querySelector(".loop-delete-cancel")
            .addEventListener("click", closeModal);

        modal
            .querySelector(".loop-delete-confirm")
            .addEventListener("click", async function () {

                const button = this;

                button.disabled = true;
                button.textContent = "Deleting...";

                try {
                    await onConfirm();
                    modal.remove();
                } catch (error) {
                    console.error(
                        "Delete confirmation error:",
                        error
                    );

                    button.disabled = false;
                    button.textContent = "Delete Item";
                }
            });

        modal
            .querySelector(".loop-delete-overlay")
            .addEventListener("click", function (event) {

                if (event.target === this) {
                    closeModal();
                }

            });
    }

    loadMyClothes();
}
// ========================================
// EDIT CLOTHING PAGE
// ========================================

const editClothingForm =
    document.getElementById("editClothingForm");

if (editClothingForm) {

    const params =
        new URLSearchParams(window.location.search);

    const itemId =
        params.get("itemId");

    const message =
        document.getElementById("editClothingMessage");

    const userData =
        localStorage.getItem("loopwearUser");


    if (!itemId) {

        message.textContent =
            "Clothing item not found.";

    } else if (!userData) {

        message.textContent =
            "Please login again.";

    } else {

        const loggedInUser =
            JSON.parse(userData);


        // ========================================
        // LOAD EXISTING ITEM
        // ========================================

        fetch(
            `${window.LOOPWEAR_API}/clothing`
        )

            .then(function (response) {
                return response.json();
            })

            .then(function (data) {

                const item =
                    data.clothing.find(function (clothing) {

                        return clothing._id === itemId;

                    });


                if (!item) {

                    message.textContent =
                        "Clothing item not found.";

                    return;
                }


                // Check ownership

                const ownerId =
                    item.owner?._id ||
                    item.owner?.id ||
                    item.owner;


                if (
                    String(ownerId) !==
                    String(loggedInUser.id)
                ) {

                    message.textContent =
                        "You cannot edit this item.";

                    return;
                }


                // Fill form

                document.getElementById(
                    "editClothingName"
                ).value = item.name || "";


                document.getElementById(
                    "editClothingImage"
                ).value = item.image || "";


                document.getElementById(
                    "editClothingSize"
                ).value = item.size || "";


                document.getElementById(
                    "editClothingCondition"
                ).value = item.condition || "";


                document.getElementById(
                    "editClothingCategory"
                ).value = item.category || "";


                document.getElementById(
                    "editClothingBrand"
                ).value = item.brand || "";


                document.getElementById(
                    "editClothingLocation"
                ).value = item.location || "";


                document.getElementById(
                    "editClothingValue"
                ).value = item.swapValue || "";

            })

            .catch(function (error) {

                console.error(
                    "Load edit item error:",
                    error
                );

                message.textContent =
                    "Unable to load clothing item.";

            });


        // ========================================
        // SAVE EDIT
        // ========================================

        editClothingForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                message.textContent =
                    "Saving changes...";


                const updatedClothing = {

                    name:
                        document
                            .getElementById(
                                "editClothingName"
                            )
                            .value
                            .trim(),

                    image:
                        document
                            .getElementById(
                                "editClothingImage"
                            )
                            .value
                            .trim(),

                    size:
                        document
                            .getElementById(
                                "editClothingSize"
                            )
                            .value,

                    condition:
                        document
                            .getElementById(
                                "editClothingCondition"
                            )
                            .value,

                    category:
                        document
                            .getElementById(
                                "editClothingCategory"
                            )
                            .value,

                    brand:
                        document
                            .getElementById(
                                "editClothingBrand"
                            )
                            .value
                            .trim(),

                    location:
                        document
                            .getElementById(
                                "editClothingLocation"
                            )
                            .value
                            .trim(),

                    swapValue:
                        Number(
                            document
                                .getElementById(
                                    "editClothingValue"
                                )
                                .value
                        ),

                    owner:
                        loggedInUser.id
                };


                try {

                    const response =
                        await fetch(
                            `${window.LOOPWEAR_API}/clothing/${itemId}`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        updatedClothing
                                    )
                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        message.textContent =
                            "✓ Changes saved successfully!";


                        setTimeout(
                            function () {

                                window.location.href =
                                    "my-clothes.html";

                            },
                            1000
                        );

                    } else {

    if (
        Array.isArray(data.errors) &&
        data.errors.length > 0
    ) {
        message.innerHTML = `
            <strong>${data.message || "Please correct the following:"}</strong>
            <ul>
                ${data.errors
                    .map(error => `<li>${error}</li>`)
                    .join("")}
            </ul>
        `;
    } else {
        message.textContent =
            data.message ||
            "Unable to update clothing.";
    }

    message.style.color = "red";
}

                } catch (error) {

                    console.error(
                        "Edit clothing error:",
                        error
                    );

                    message.textContent =
                        "Unable to connect to LoopWear server.";

                }

            }
        );


        // ========================================
        // CANCEL
        // ========================================

        document
            .getElementById("cancelEditClothing")
            .addEventListener(
                "click",
                function () {

                    window.location.href =
                        "my-clothes.html";

                }
            );

    }
}
