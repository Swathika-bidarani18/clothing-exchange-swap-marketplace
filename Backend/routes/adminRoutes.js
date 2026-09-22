const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Clothing = require("../models/Clothing");
const SwapRequest = require("../models/SwapRequest");
const Message = require("../models/Message");


// ========================================
// ADMIN CHECK
// ========================================

async function checkAdmin(req, res, next) {

    try {

        const userId = req.headers["x-user-id"];

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required."
            });
        }

        const user = await User.findById(userId);

        if (!user || user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access denied."
            });
        }

        req.admin = user;

        next();

    } catch (error) {

        console.error(
            "Admin authentication error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to verify admin access."
        });

    }
}


// ========================================
// DASHBOARD STATISTICS
// ========================================

router.get("/stats", checkAdmin, async (req, res) => {

    try {

        const [
            totalUsers,
            totalClothing,
            totalSwaps,
            totalMessages
        ] = await Promise.all([

            User.countDocuments(),

            Clothing.countDocuments(),

            SwapRequest.countDocuments(),

            Message.countDocuments()

        ]);


        const successfulSwaps =
            await SwapRequest.countDocuments({
                status: {
    $in: [
        "Accepted",
        "ExchangeConfirmed",
        "Completed"
    ]
}
            });


        res.status(200).json({

            success: true,

            stats: {
                totalUsers,
                totalClothing,
                totalSwaps,
                successfulSwaps,
                totalMessages
            }

        });

    } catch (error) {

        console.error(
            "Admin stats error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to load admin statistics."
        });

    }

});


// ========================================
// GET USERS
// ========================================

router.get("/users", checkAdmin, async (req, res) => {

    try {

        const users =
            await User.find()
                .select("-password")
                .sort({ createdAt: -1 });


        res.status(200).json({

            success: true,

            users

        });

    } catch (error) {

        console.error(
            "Admin users error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to load users."
        });

    }

});


// ========================================
// DELETE USER
// ========================================

router.delete("/users/:id", checkAdmin, async (req, res) => {

    try {

        const user =
            await User.findById(req.params.id);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }


        if (
            String(user._id) ===
            String(req.admin._id)
        ) {

            return res.status(400).json({
                success: false,
                message: "You cannot delete your own admin account."
            });

        }


        await User.findByIdAndDelete(req.params.id);


        res.status(200).json({

            success: true,

            message: "User deleted successfully."

        });

    } catch (error) {

        console.error(
            "Delete user error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to delete user."
        });

    }

});


// ========================================
// GET CLOTHING
// ========================================

router.get("/clothing", checkAdmin, async (req, res) => {

    try {

        const clothing =
            await Clothing.find()
                .populate("owner", "name email location")
                .sort({ createdAt: -1 });


        res.status(200).json({

            success: true,

            clothing

        });

    } catch (error) {

        console.error(
            "Admin clothing error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to load clothing listings."
        });

    }

});


// ========================================
// DELETE CLOTHING
// ========================================

router.delete("/clothing/:id", checkAdmin, async (req, res) => {

    try {

        const clothing =
            await Clothing.findById(req.params.id);

        if (!clothing) {

            return res.status(404).json({
                success: false,
                message: "Clothing listing not found."
            });

        }


        await Clothing.findByIdAndDelete(
            req.params.id
        );


        res.status(200).json({

            success: true,

            message: "Clothing listing removed."

        });

    } catch (error) {

        console.error(
            "Delete clothing error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to remove clothing listing."
        });

    }

});


// ========================================
// GET SWAP REQUESTS
// ========================================

router.get("/swaps", checkAdmin, async (req, res) => {

    try {

        const swaps =
            await SwapRequest.find()
                .populate("requester", "name email location")
                .populate("owner", "name email location")
                .populate("clothing")
                .populate("offeredClothing")
                .sort({ createdAt: -1 });


        res.status(200).json({

            success: true,

            swaps

        });

    } catch (error) {

        console.error(
            "Admin swaps error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to load swap requests."

        });

    }

});


module.exports = router;