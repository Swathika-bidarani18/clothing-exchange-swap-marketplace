const express = require("express");
const mongoose = require("mongoose");
const SwapRequest = require("../models/SwapRequest");
const Clothing = require("../models/Clothing");
const User = require("../models/User");

const router = express.Router();

// ========================================
// GET SWAP HISTORY FOR A USER
// ========================================
router.get("/history/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const history = await SwapRequest.find({
            $or: [{ requester: userId }, { owner: userId }]
        })
            .populate("clothing")
            .populate("offeredClothing")
            .populate("requester", "name email location")
            .populate("owner", "name email location")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, history });
    } catch (error) {
        console.error("Get swap history error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while fetching swap history."
        });
    }
});

// ========================================
// CREATE SWAP REQUEST
// ========================================
router.post("/", async (req, res) => {
    try {
       const {
    clothingId,
    requesterId,
    offeredClothingId
} = req.body;

if (!clothingId || !requesterId) {
    return res.status(400).json({
        success: false,
        message: "Clothing ID and requester ID are required."
    });
}

// Validate MongoDB IDs
if (!mongoose.Types.ObjectId.isValid(clothingId)) {
    return res.status(400).json({
        success: false,
        message: "Invalid clothing ID."
    });
}

if (!mongoose.Types.ObjectId.isValid(requesterId)) {
    return res.status(400).json({
        success: false,
        message: "Invalid requester ID."
    });
}

if (
    offeredClothingId &&
    !mongoose.Types.ObjectId.isValid(offeredClothingId)
) {
    return res.status(400).json({
        success: false,
        message: "Invalid offered clothing ID."
    });
}

// Verify requester exists
const requester =
    await User.findById(requesterId);

if (!requester) {
    return res.status(404).json({
        success: false,
        message: "Requester account not found."
    });
}

        const clothing = await Clothing.findById(clothingId);

        if (!clothing) {
            return res.status(404).json({
                success: false,
                message: "Clothing item not found."
            });
        }

        if (clothing.owner.toString() === requesterId) {
            return res.status(400).json({
                success: false,
                message: "You cannot request a swap for your own clothing."
            });
        }

        // If the requester selected an item to offer, make sure it belongs to them.
        if (offeredClothingId) {
            if (offeredClothingId === clothingId) {
    return res.status(400).json({
        success: false,
        message:
            "You cannot offer the same clothing item you are requesting."
    });
}
            const offeredClothing = await Clothing.findById(offeredClothingId);

            if (!offeredClothing) {
                return res.status(404).json({
                    success: false,
                    message: "Your offered clothing item was not found."
                });
            }

            if (offeredClothing.owner.toString() !== requesterId) {
                return res.status(403).json({
                    success: false,
                    message: "You can only offer clothing from your own closet."
                });
            }
        }

        // Avoid duplicate pending requests for the same target item.
        const existingRequest = await SwapRequest.findOne({
            clothing: clothingId,
            requester: requesterId,
            status: { $in: ["Pending", "Accepted", "ExchangeConfirmed"] }
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "You already have an active request for this clothing item."
            });
        }

        const swapRequest = await SwapRequest.create({
            clothing: clothingId,
            offeredClothing: offeredClothingId || null,
            requester: requesterId,
            owner: clothing.owner,
            status: "Pending"
        });

        res.status(201).json({
            success: true,
            message: "Swap request sent successfully!",
            swapRequest
        });
    } catch (error) {
        console.error("Create swap request error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while creating swap request."
        });
    }
});

// ========================================
// GET ONE SWAP REQUEST
// ========================================
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const swapRequest =
            await SwapRequest.findById(id)
                .populate("clothing")
                .populate("offeredClothing")
                .populate("requester", "name email location")
                .populate("owner", "name email location");

        if (!swapRequest) {
            return res.status(404).json({
                success: false,
                message: "Swap request not found."
            });
        }

        res.status(200).json({
            success: true,
            swapRequest
        });

    } catch (error) {

        console.error(
            "Get swap request error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching swap request."
        });
    }
});

// ========================================
// UPDATE SWAP REQUEST / EXCHANGE FLOW
// ========================================
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status, action, userId } = req.body;

       if (!userId) {
    return res.status(400).json({
        success: false,
        message: "User ID is required."
    });
}

if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
        success: false,
        message: "Invalid user ID."
    });
}
        const swapRequest = await SwapRequest.findById(id);

        if (!swapRequest) {
            return res.status(404).json({
                success: false,
                message: "Swap request not found."
            });
        }

        const isOwner = swapRequest.owner.toString() === userId;
        const isRequester = swapRequest.requester.toString() === userId;

        if (!isOwner && !isRequester) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this swap."
            });
        }

        // Accept / reject: only the clothing owner can decide.
        if (status) {
            if (!["Accepted", "Rejected"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status."
                });
            }

            if (!isOwner) {
                return res.status(403).json({
                    success: false,
                    message: "Only the clothing owner can respond to this request."
                });
            }

            if (swapRequest.status !== "Pending") {
                return res.status(400).json({
                    success: false,
                    message: "This request has already been processed."
                });
            }

            swapRequest.status = status;

            if (status === "Rejected") {
                swapRequest.requesterConfirmed = false;
                swapRequest.ownerConfirmed = false;
            }

            await swapRequest.save();

            return res.status(200).json({
                success: true,
                message: `Swap request ${status.toLowerCase()} successfully.`,
                swapRequest
            });
        }

        // Both people confirm the accepted exchange.
        if (action === "confirm_exchange") {
            if (swapRequest.status !== "Accepted") {
                return res.status(400).json({
                    success: false,
                    message: "Exchange confirmation is available after the request is accepted."
                });
            }

            if (isRequester) swapRequest.requesterConfirmed = true;
            if (isOwner) swapRequest.ownerConfirmed = true;

            if (swapRequest.requesterConfirmed && swapRequest.ownerConfirmed) {
                swapRequest.status = "ExchangeConfirmed";
            }

            await swapRequest.save();

            return res.status(200).json({
                success: true,
                message: swapRequest.status === "ExchangeConfirmed"
                    ? "Both members confirmed the exchange. Handover is ready."
                    : "Your exchange confirmation was recorded.",
                swapRequest
            });
        }

        // Both people confirm the physical/local handover.
        if (action === "confirm_handover") {
            if (swapRequest.status !== "ExchangeConfirmed") {
                return res.status(400).json({
                    success: false,
                    message: "Handover confirmation is available after both members confirm the exchange."
                });
            }

            if (isRequester) swapRequest.requesterHandoverConfirmed = true;
            if (isOwner) swapRequest.ownerHandoverConfirmed = true;

            if (
                swapRequest.requesterHandoverConfirmed &&
                swapRequest.ownerHandoverConfirmed
            ) {
                swapRequest.status = "Completed";
            }

            await swapRequest.save();

            return res.status(200).json({
                success: true,
                message: swapRequest.status === "Completed"
                    ? "Swap completed successfully. Keep the loop moving!"
                    : "Your handover confirmation was recorded.",
                swapRequest
            });
        }

        return res.status(400).json({
            success: false,
            message: "No valid swap action was provided."
        });
    } catch (error) {
        console.error("Update swap request error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while updating swap request."
        });
    }
});

module.exports = router;
