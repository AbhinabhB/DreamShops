import User from "../models/user.models.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

export const getAnalytics = async (req, res) => {
    try {
        const analyticsData = await getAnalyticsData();

        const endDate = new Date()
        const startDate = new Date(endDate - 7 * 24 * 60 * 60 * 1000);

        const dailySalesData = await getDailySalesData(startDate, endDate);

        res.json({
            analyticsData,
            dailySalesData,
        });
    } catch (error) {
        console.log("Error in analytics controller", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getAnalyticsData = async() => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();

        const salesData = await Order.aggregate([
            {
                $group: {
                    _id: null,  // groups all documents
                    totalSales: {$sum: 1},
                    totalRevenue: {$sum: "$totalAmount"},
                },
            },
        ]);

        const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

        return {
            users: totalUsers,
            products: totalProducts,
            totalSales,
            totalRevenue,
        };
    } catch (error) {
        console.log("Error in getAnalyticsData function in analytics controller:", error);
        throw error;
    }
};

const getDailySalesData = async(startDate, endDate) => {
    try {
        const dailySalesData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        const dateArray = getDatesInRange(startDate, endDate);

        return dateArray.map(date => {
            const foundData = dailySalesData.find(item => item._id === date);

            return {
                date,
                sales: foundData?.sales || 0,
                revenue: foundData?.revenue || 0,
            };
        });
    } catch (error) {
        console.log("Error in getDailySalesData function in analytics controller:", error);
        throw error;
    }
};

function getDatesInRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);

    while(currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
};