const mongoose = require("mongoose");

const swapRequestSchema = new mongoose.Schema(
    {
        clothing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Clothing",
            required: true
        },

        // The clothing offered by the person requesting the swap.
        // Optional so existing requests created before this feature keep working.
        offeredClothing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Clothing",
            default: null
        },

        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Accepted",
                "Rejected",
                "ExchangeConfirmed",
                "Completed",
                "Cancelled"
            ],
            default: "Pending"
        },

        requesterConfirmed: {
            type: Boolean,
            default: false
        },

        ownerConfirmed: {
            type: Boolean,
            default: false
        },

        requesterHandoverConfirmed: {
            type: Boolean,
            default: false
        },

        ownerHandoverConfirmed: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const SwapRequest = mongoose.model("SwapRequest", swapRequestSchema);

module.exports = SwapRequest;
