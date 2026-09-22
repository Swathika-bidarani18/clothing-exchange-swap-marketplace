const express = require("express");
const router = express.Router();

const Message = require("../models/Message");
const SwapRequest = require("../models/SwapRequest");


// ========================================
// SEND MESSAGE
// ========================================

router.post("/", async (req, res) => {

    try {

        const {
            swapRequestId,
            senderId,
            receiverId,
            message
        } = req.body;


        if (
            !swapRequestId ||
            !senderId ||
            !receiverId ||
            !message ||
            !message.trim()
        ) {

            return res.status(400).json({
                success: false,
                message: "Message details are required."
            });

        }


        const swapRequest =
            await SwapRequest.findById(swapRequestId);

        if (!swapRequest) {

            return res.status(404).json({
                success: false,
                message: "Swap request not found."
            });

        }


        const newMessage =
            await Message.create({

                swapRequest: swapRequestId,

                sender: senderId,

                receiver: receiverId,

                message: message.trim()

            });


        const populatedMessage =
            await Message.findById(newMessage._id)
                .populate("sender", "name")
                .populate("receiver", "name");


        res.status(201).json({

            success: true,

            message: "Message sent successfully.",

            chatMessage: populatedMessage

        });


    } catch (error) {

        console.error(
            "Send message error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message: "Server error while sending message."

        });

    }

});
// ========================================
// GET UNREAD MESSAGES
// ========================================

router.get("/unread/:userId", async (req, res) => {

    try {

        const { userId } = req.params;

        const unreadMessages = await Message.find({

            receiver: userId,

            $or: [
                { read: false },
                { read: { $exists: false } }
            ]

        })
            .populate("sender", "name")
            .populate("swapRequest");

        res.status(200).json({

            success: true,

            count: unreadMessages.length,

            messages: unreadMessages

        });

    } catch (error) {

        console.error(
            "Unread message error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to load unread messages."

        });

    }

});


// ========================================
// GET CHAT MESSAGES
// ========================================

router.get("/:swapRequestId", async (req, res) => {

    try {

        const { swapRequestId } =
            req.params;


        const messages =
            await Message.find({
                swapRequest: swapRequestId
            })
                .populate("sender", "name")
                .populate("receiver", "name")
                .sort({ createdAt: 1 });


        res.status(200).json({

            success: true,

            messages

        });


    } catch (error) {

        console.error(
            "Get messages error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message: "Server error while loading messages."

        });

    }

});


router.patch(
    "/read/:swapRequestId/:userId",
    async (req, res) => {

        try {

            const {
                swapRequestId,
                userId
            } = req.params;


            await Message.updateMany(

                {
                    swapRequest:
                        swapRequestId,

                    receiver:
                        userId,

                    $or: [
                        { read: false },
                        { read: { $exists: false } }
                    ]
                },

                {
                    $set: {
                        read: true
                    }
                }
            );


            res.status(200).json({

                success: true,

                message:
                    "Messages marked as read."
            });

        } catch (error) {

            console.error(
                "Mark messages read error:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to mark messages as read."
            });
        }
    }
);


module.exports = router;