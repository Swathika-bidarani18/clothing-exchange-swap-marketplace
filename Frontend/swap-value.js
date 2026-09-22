const SWAP_VALUE_API = window.LOOPWEAR_API;

const yourSwapValue =
    document.getElementById("yourSwapValue");

const targetSwapValue =
    document.getElementById("targetSwapValue");

const swapValueResult =
    document.getElementById("swapValueResult");


function getSwapUser() {

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


function getItemId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return (
        params.get("itemId") ||
        params.get("id")
    );
}


async function loadSwapValue() {

    const itemId = getItemId();
    const user = getSwapUser();

    console.log("Swap Value Item ID:", itemId);

    if (!itemId) {
        console.error("No item ID found in URL.");
        return;
    }

    try {

        // ========================================
        // GET CURRENT ITEM
        // ========================================

        const response =
            await fetch(
                `${SWAP_VALUE_API}/clothing/${encodeURIComponent(itemId)}`
            );

        const data =
            await response.json();

        console.log(
            "Swap Value Item Response:",
            data
        );

        if (
            !response.ok ||
            !data.success ||
            !data.clothing
        ) {
            throw new Error(
                data.message ||
                "Unable to load item."
            );
        }


        const item =
            data.clothing;


        // ========================================
        // CURRENT ITEM VALUE
        // ========================================

        const targetValue =
            Number(item.swapValue);


        console.log(
            "Target Item:",
            item.name
        );

        console.log(
            "Target Swap Value:",
            targetValue
        );


        if (
            Number.isFinite(targetValue)
        ) {

            targetSwapValue.textContent =
                targetValue.toLocaleString("en-IN");

        } else {

            targetSwapValue.textContent =
                "0";

        }


        // ========================================
        // USER LOGIN CHECK
        // ========================================

        if (!user || !user.id) {

            yourSwapValue.textContent =
                "Login";

            swapValueResult.textContent =
                "Log in to compare your clothing value with this item.";

            return;
        }


        // ========================================
        // GET USER'S CLOTHING
        // ========================================

        const clothingResponse =
            await fetch(
                `${SWAP_VALUE_API}/clothing`
            );

        const clothingData =
            await clothingResponse.json();


        if (
            !clothingResponse.ok ||
            !clothingData.success
        ) {
            throw new Error(
                "Unable to load your clothing."
            );
        }


        const myClothing =
            (clothingData.clothing || [])
                .filter(clothing => {

                    const ownerId =
                        clothing.owner?._id ||
                        clothing.owner;

                    return String(ownerId) ===
                        String(user.id);
                });


        console.log(
            "My Clothing:",
            myClothing
        );


        // ========================================
        // NO USER CLOTHING
        // ========================================

        if (!myClothing.length) {

            yourSwapValue.textContent =
                "—";

            swapValueResult.textContent =
                "Add a clothing item to compare its swap value.";

            return;
        }


        // ========================================
        // FIRST USER ITEM
        // ========================================

        const offeredItem =
            myClothing[0];


        const offeredValue =
            Number(
                offeredItem.swapValue
            );


        yourSwapValue.textContent =
            `₹${offeredValue.toLocaleString("en-IN")}`;


        // ========================================
        // VALUE COMPARISON
        // ========================================

        const difference =
            Math.abs(
                offeredValue -
                targetValue
            );


        const lowerValue =
            Math.min(
                offeredValue,
                targetValue
            );


        const percentageDifference =
            lowerValue > 0
                ? (difference / lowerValue) * 100
                : 0;


        if (difference === 0) {

    swapValueResult.innerHTML = `
        <div class="swap-result-title">
            Perfect value match
        </div>

        <div class="swap-result-text">
            Your clothing and this item have the same estimated swap value.
        </div>
    `;

} else if (
    percentageDifference <= 20
) {

    swapValueResult.innerHTML = `
        <div class="swap-result-title">
            Close value match
        </div>

        <div class="swap-result-text">
            The estimated values are close.
            You can negotiate the final swap in chat.
        </div>
    `;

} else {

    swapValueResult.innerHTML = `
        <div class="swap-result-title">
            Value difference
        </div>

        <div class="swap-result-amount ${
            targetValue > offeredValue
                ? "swap-benefit"
                : "swap-loss"
        }">
            ${targetValue > offeredValue ? "+" : "-"}₹${difference.toLocaleString("en-IN")}
        </div>

        <div class="swap-result-text">
            ${
                targetValue > offeredValue
                    ? "This swap gives you higher estimated value."
                    : "This swap gives you lower estimated value."
            }
        </div>
    `;
}


    } catch (error) {

        console.error(
            "Swap value error:",
            error
        );

        swapValueResult.textContent =
            "Unable to compare swap values right now.";
    }
}


loadSwapValue();