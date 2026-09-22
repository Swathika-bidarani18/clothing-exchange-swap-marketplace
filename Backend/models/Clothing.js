const mongoose = require("mongoose");

const clothingSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String,
            required: true
        },

        size: {
            type: String,
            required: true,
            trim: true
        },

        condition: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        brand: {
            type: String,
            default: "Not specified",
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        swapValue: {
            type: Number,
            required: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Clothing = mongoose.model("Clothing", clothingSchema);

module.exports = Clothing;