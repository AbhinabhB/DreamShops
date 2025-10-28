import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
    try {
        const products = await Product.find({ _id: { $in: req.user.cartItems } });

        // add quantity for each product
        const cartItems = products.map(product => {
            const item = req.user.cartItems.find(item => item.id === product._id.toString());
            return { ...product.toJSON(), quantity: item.quantity }; 
        });

        res.json(cartItems);
    } catch (error) {
        console.log("Error in getCartItems controller:", error.message);
        res.status(500).json({message: "Server Error", error: error.message });
    }
};

export const addToCart = async (req, res) => {
    try {
        const productId = req.body.productId;
        const user = req.user;  // since the addToCart route is protected(protectRoute middleware), we have access to req.user

        const existingItem = user.cartItems.find(item => item.id === productId);

        if(existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItems.push(productId);
        }

        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.log("Error in addToCart controller:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const removeAllFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user; // since the removeAllFromCart route is protected(protectRoute middleware), we have access to req.user

        if(!productId) {
            user.cartItems = []; // here if there is no productId, we remove all items from the cart. Used when we click empty cart button
        } else {
            user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        }

        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.log("Error in removeAllFromCart controller:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const removeAllProductsFromCart = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Simply clear all cart items
        user.cartItems = [];
        await user.save();

        res.json({ message: "Cart cleared successfully", cart: user.cartItems });
    } catch (error) {
        console.error("Error in removeAllFromCart:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        const { id: productId } = req.params;
        const { quantity } = req.body;
        const user = req.user // since the updateQuantity route is protected(protectRoute middleware), we have access to req.user

        const existingItem = user.cartItems.find(item => item.id === productId);
        if(existingItem) {
            if(quantity <= 0) {
                user.cartItems = user.cartItems.filter(item => item.id !== productId);
                await user.save();
                return res.json(user.cartItems);
            }

            existingItem.quantity = quantity;
            await user.save();
            res.json(user.cartItems);
        } else {
            res.status(404).json({ message: "Product not found in cart" });
        }
    } catch (error) {
        console.log("Error in updateQuantity controller:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};