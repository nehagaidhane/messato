const express = require("express");
const router = express.Router();
const { db } = require("../config/db");

// GET menu by vendor + date
router.get("/", async (req, res) => {
  try {
    const { vendorId, date } = req.query;

    if (!vendorId || !date) {
      return res.status(400).json({ error: "vendorId and date required" });
    }

    // 1️⃣ Get menus
    const [menus] = await db.query(
      `SELECT * FROM menus 
       WHERE vendor_id = ? AND menu_date = ?`,
      [vendorId, date]
    );

    if (menus.length === 0) {
      return res.json({ lunch: null, dinner: null });
    }

    // 2️⃣ Get menu items
    const menuIds = menus.map(m => m.id);

    const [items] = await db.query(
      `SELECT * FROM menu_items WHERE menu_id IN (?)`,
      [menuIds]
    );

    // 3️⃣ Attach items to menus
    const formattedMenus = menus.map(menu => {
      const menuItems = items
        .filter(i => i.menu_id === menu.id)
        .map(i => ({
          name: i.item_name,
          quantity: i.quantity
        }));

      return {
        id: menu.id,
        name: menu.name,
        description: menu.description,
        price: menu.price,
        image: menu.image,
        time: `${menu.delivery_start} - ${menu.delivery_end}`,
        items: menuItems,
        mealType: menu.meal_type
      };
    });

    // 4️⃣ Separate lunch & dinner
    const lunch = formattedMenus.find(m => m.mealType === "lunch") || null;
    const dinner = formattedMenus.find(m => m.mealType === "dinner") || null;

    res.json({ lunch, dinner });

  } catch (err) {
    console.error("Menu API Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;