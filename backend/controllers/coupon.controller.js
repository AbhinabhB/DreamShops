import Coupon from "../models/coupon.model.js";

export const getCoupon =  async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
        res.json(coupon || null);
    } catch (error) {
        console.log("Error in getCoupon in coupon controller:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code: code, userId: req.user._id, isActive: true });

        if(!coupon) {
            return res.status(404).json({ message: "Coupon not found or inactive" });
        }

        if(coupon.expirationDate < new Date()) {
            return res.status(404).json({ message: "Coupon has expired" });
        }

        return res.json({
            message: "Coupon is valid",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage,
        });
    } catch (error) {
        console.log("Error in validateCoupon in coupon controller:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};