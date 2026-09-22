const express = require("express");
const Clothing = require("../models/Clothing");

const router = express.Router();


// ========================================
// ADD CLOTHING
// ========================================

router.post("/", async (req, res) => {
    try {
        let {
            name,
            image,
            size,
            condition,
            category,
            brand,
            location,
            swapValue,
            owner
        } = req.body;

        // Clean text input
        name = name?.trim();
        image = image?.trim();
        size = size?.trim();
        condition = condition?.trim();
        category = category?.trim();
        brand = brand?.trim();
        location = location?.trim();

        const errors = [];

        // Required fields
        if (!name) errors.push("Clothing name is required.");
        if (!image) errors.push("Clothing image is required.");
        if (!size) errors.push("Size is required.");
        if (!condition) errors.push("Condition is required.");
        if (!category) errors.push("Category is required.");
        if (!location) errors.push("Location is required.");
        if (!owner) errors.push("Owner is required.");

        // Text validation
        if (name && (name.length < 2 || name.length > 100)) {
            errors.push(
                "Clothing name must be between 2 and 100 characters."
            );
        }

        if (size && size.length > 30) {
            errors.push("Size must not exceed 30 characters.");
        }

        if (condition && condition.length > 50) {
            errors.push(
                "Condition must not exceed 50 characters."
            );
        }

        if (category && category.length > 50) {
            errors.push(
                "Category must not exceed 50 characters."
            );
        }

        if (location && location.length > 100) {
            errors.push(
                "Location must not exceed 100 characters."
            );
        }

        if (brand && brand.length > 50) {
            errors.push(
                "Brand must not exceed 50 characters."
            );
        }

        // Swap value validation
        const numericSwapValue = Number(swapValue);

        if (
            swapValue === undefined ||
            swapValue === null ||
            swapValue === ""
        ) {
            errors.push("Swap value is required.");
        } else if (
            !Number.isFinite(numericSwapValue) ||
            numericSwapValue <= 0
        ) {
            errors.push(
                "Swap value must be a number greater than 0."
            );
        }

        // Return all validation errors
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Please correct the following:",
                errors
            });
        }

        const clothing = await Clothing.create({
            name,
            image,
            size,
            condition,
            category,
            brand: brand || "Not specified",
            location,
            swapValue: numericSwapValue,
            owner
        });

        res.status(201).json({
            success: true,
            message: "Clothing item added successfully!",
            clothing
        });

    } catch (error) {
        console.error(
            "Add clothing error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error while adding clothing."
        });
    }
});


// ========================================
// GET ALL CLOTHING
// ========================================

router.get("/", async (req, res) => {
    try {
        const clothing = await Clothing
            .find()
            .populate(
                "owner",
                "name email location"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            count: clothing.length,
            clothing
        });

    } catch (error) {
        console.error(
            "Get clothing error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error while fetching clothing."
        });
    }
});


// ========================================
// GET NEARBY CLOTHING
// ========================================

router.get("/nearby", async (req, res) => {
    try {
        const { location } = req.query;

        if (!location || !location.trim()) {
            return res.status(400).json({
                success: false,
                message: "Location is required."
            });
        }

        const nearbyClothing = await Clothing
            .find({
                location: {
                    $regex: `^${location.trim()}$`,
                    $options: "i"
                }
            })
            .populate(
                "owner",
                "name email location"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            count: nearbyClothing.length,
            location: location.trim(),
            clothing: nearbyClothing
        });

    } catch (error) {
        console.error(
            "Nearby clothing error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error while fetching nearby clothing."
        });
    }
});
// GET SINGLE CLOTHING ITEM
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const clothing = await Clothing
            .findById(id)
            .populate("owner", "name email location");

        if (!clothing) {
            return res.status(404).json({
                success: false,
                message: "Clothing item not found."
            });
        }

        res.status(200).json({
            success: true,
            clothing
        });

    } catch (error) {
        console.error(
            "Get clothing item error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching clothing item."
        });
    }
});


// ========================================
// UPDATE CLOTHING
// ========================================

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            image,
            size,
            condition,
            category,
            brand,
            location,
            swapValue,
            owner
        } = req.body;

        const clothing =
            await Clothing.findById(id);

        if (!clothing) {
            return res.status(404).json({
                success: false,
                message: "Clothing item not found."
            });
        }

        // Only the owner can edit the clothing
        if (
            !owner ||
            clothing.owner.toString() !==
            owner.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to edit this clothing item."
            });
        }

        // Clean input
const cleanName = name?.trim();
const cleanImage = image?.trim();
const cleanSize = size?.trim();
const cleanCondition = condition?.trim();
const cleanCategory = category?.trim();
const cleanBrand = brand?.trim();
const cleanLocation = location?.trim();

const errors = [];

if (!cleanName) errors.push("Clothing name is required.");
if (!cleanImage) errors.push("Clothing image is required.");
if (!cleanSize) errors.push("Size is required.");
if (!cleanCondition) errors.push("Condition is required.");
if (!cleanCategory) errors.push("Category is required.");
if (!cleanLocation) errors.push("Location is required.");

if (
    cleanName &&
    (cleanName.length < 2 || cleanName.length > 100)
) {
    errors.push(
        "Clothing name must be between 2 and 100 characters."
    );
}

if (cleanSize && cleanSize.length > 30) {
    errors.push("Size must not exceed 30 characters.");
}

if (cleanCondition && cleanCondition.length > 50) {
    errors.push(
        "Condition must not exceed 50 characters."
    );
}

if (cleanCategory && cleanCategory.length > 50) {
    errors.push(
        "Category must not exceed 50 characters."
    );
}

if (cleanLocation && cleanLocation.length > 100) {
    errors.push(
        "Location must not exceed 100 characters."
    );
}

if (cleanBrand && cleanBrand.length > 50) {
    errors.push(
        "Brand must not exceed 50 characters."
    );
}

const numericSwapValue = Number(swapValue);

if (
    swapValue === undefined ||
    swapValue === null ||
    swapValue === ""
) {
    errors.push("Swap value is required.");
} else if (
    !Number.isFinite(numericSwapValue) ||
    numericSwapValue <= 0
) {
    errors.push(
        "Swap value must be a number greater than 0."
    );
}

if (errors.length > 0) {
    return res.status(400).json({
        success: false,
        message: "Please correct the following:",
        errors
    });
}

        // Update item
        clothing.name = cleanName;
clothing.image = cleanImage;
clothing.size = cleanSize;
clothing.condition = cleanCondition;
clothing.category = cleanCategory;
clothing.brand = cleanBrand || "Not specified";
clothing.location = cleanLocation;
clothing.swapValue = numericSwapValue;

        await clothing.save();

        res.status(200).json({
            success: true,
            message:
                "Clothing item updated successfully!",
            clothing
        });

    } catch (error) {
        console.error(
            "Update clothing error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while updating clothing."
        });
    }
});


// ========================================
// DELETE CLOTHING
// ========================================

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { owner } = req.body;

        const clothing =
            await Clothing.findById(id);

        if (!clothing) {
            return res.status(404).json({
                success: false,
                message: "Clothing item not found."
            });
        }

        // Only the owner can delete the clothing
        if (
            !owner ||
            clothing.owner.toString() !==
            owner.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only the clothing owner can delete this item."
            });
        }

        await Clothing.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message:
                "Clothing item deleted successfully!"
        });

    } catch (error) {
        console.error(
            "Delete clothing error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while deleting clothing."
        });
    }
});


module.exports = router;