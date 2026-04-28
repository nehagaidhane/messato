const { db } = require("../config/db");

// ─── Helper: attach menu_items rows onto each menu ─────────────
const attachItems = async (menus) => {
  for (let menu of menus) {
    const [items] = await db.query(
      "SELECT item_name, quantity FROM menu_items WHERE menu_id = ?",
      [menu.id]
    );
    items.forEach(i => { menu[i.item_name] = i.quantity; });
    menu.slot      = menu.meal_type;
    menu.image_url = menu.image;
  }
  return menus;
};

// ─── Helper: parse schedule_days safely ───────────────────────
const parseDays = (raw) => {
  try { return JSON.parse(raw || "[]"); } catch (_) { return []; }
};

const toIsoDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const addDays = (isoDate, days) => {
  const base = new Date(`${isoDate}T00:00:00`);
  base.setDate(base.getDate() + days);
  return toIsoDate(base);
};

const buildMenuDescription = (menu) => {
  const parts = [menu.roti, menu.sabji, menu.dal, menu.rice, menu.extras, menu.sweet]
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean);

  return parts.join(", ");
};

const normalizeUserMenu = (menu) => {
  if (!menu) return null;

  return {
    id: menu.id,
    name: menu.name,
    price: menu.price,
    type: menu.type,
    meal_type: menu.meal_type,
    menu_date: menu.menu_date,
    image: menu.image,
    image_url: menu.image_url || menu.image,
    description: buildMenuDescription(menu),
    time: menu.meal_type === "lunch" ? "12:00 – 3:00 PM" : "7:00 – 9:00 PM",
  };
};


// ══════════════════════════════════════════════════════════════
// GET ALL MENUS (for the vendor)
// ══════════════════════════════════════════════════════════════
exports.getMenus = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const [menus] = await db.query(
      `SELECT * FROM menus WHERE vendor_id = ? ORDER BY created_at DESC`,
      [vendorId]
    );

    await attachItems(menus);
    res.json(menus);

  } catch (err) {
    console.error("GET MENU ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


// ══════════════════════════════════════════════════════════════
// CREATE MENU
// ══════════════════════════════════════════════════════════════
exports.createMenu = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const {
      name, type, slot, price, menu_date,
      roti, sabji, dal, rice, extras, sweet,
      // subscription extras
      schedule_days,
      monthly_price_lunch, monthly_price_dinner, monthly_price_both,
      plan_description,
      skip_limit, pause_limit,
      available,
    } = req.body;

    const image = req.file ? req.file.path : null;

    const [result] = await db.query(
      `INSERT INTO menus 
        (vendor_id, name, price, type, meal_type, menu_date, image,
         available,
         schedule_days,
         monthly_price_lunch, monthly_price_dinner, monthly_price_both,
         plan_description, skip_limit, pause_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vendorId,
        name       || "",
        price      || 0,
        type       || "daily",
        slot       || "lunch",
        menu_date  || new Date().toISOString().split("T")[0],
        image,
        available === undefined ? 1 : Number(Boolean(available)),
        schedule_days         || JSON.stringify(["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]),
        monthly_price_lunch   || null,
        monthly_price_dinner  || null,
        monthly_price_both    || null,
        plan_description      || "",
        skip_limit            || null,
        pause_limit           || null,
      ]
    );

    const menuId = result.insertId;

    // Insert menu items
    const items = [
      { key: "roti",   value: roti },
      { key: "sabji",  value: sabji },
      { key: "dal",    value: dal },
      { key: "rice",   value: rice },
      { key: "extras", value: extras },
      { key: "sweet",  value: sweet },
    ];

    for (const item of items) {
      if (item.value) {
        await db.query(
          "INSERT INTO menu_items (menu_id, item_name, quantity) VALUES (?, ?, ?)",
          [menuId, item.key, item.value]
        );
      }
    }

    res.json({ message: "Menu created", id: menuId });

  } catch (err) {
    console.error("CREATE MENU ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


// ══════════════════════════════════════════════════════════════
// UPDATE MENU
// ══════════════════════════════════════════════════════════════
exports.updateMenu = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { id }   = req.params;

    const {
      name, type, slot, price, menu_date,
      roti, sabji, dal, rice, extras, sweet,
      schedule_days,
      monthly_price_lunch, monthly_price_dinner, monthly_price_both,
      plan_description,
      skip_limit, pause_limit,
    } = req.body;

    const image = req.file ? req.file.path : null;

    await db.query(
      `UPDATE menus 
       SET name=?, price=?, type=?, meal_type=?, menu_date=?,
           image=COALESCE(?, image),
           schedule_days=?,
           monthly_price_lunch=?, monthly_price_dinner=?, monthly_price_both=?,
           plan_description=?, skip_limit=?, pause_limit=?
       WHERE id=? AND vendor_id=?`,
      [
        name      || "",
        price     || 0,
        type      || "daily",
        slot      || "lunch",
        menu_date || new Date().toISOString().split("T")[0],
        image,
        schedule_days        || JSON.stringify(["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]),
        monthly_price_lunch  || null,
        monthly_price_dinner || null,
        monthly_price_both   || null,
        plan_description     || "",
        skip_limit           || null,
        pause_limit          || null,
        id,
        vendorId,
      ]
    );

    // Refresh menu items
    await db.query("DELETE FROM menu_items WHERE menu_id = ?", [id]);

    const items = [
      { key: "roti",   value: roti },
      { key: "sabji",  value: sabji },
      { key: "dal",    value: dal },
      { key: "rice",   value: rice },
      { key: "extras", value: extras },
      { key: "sweet",  value: sweet },
    ];

    for (const item of items) {
      if (item.value) {
        await db.query(
          "INSERT INTO menu_items (menu_id, item_name, quantity) VALUES (?, ?, ?)",
          [id, item.key, item.value]
        );
      }
    }

    res.json({ message: "Menu updated" });

  } catch (err) {
    console.error("UPDATE MENU ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


// ══════════════════════════════════════════════════════════════
// DELETE MENU
// ══════════════════════════════════════════════════════════════
exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM menu_items WHERE menu_id = ?", [id]);
    await db.query("DELETE FROM menus WHERE id = ?", [id]);

    res.json({ message: "Deleted" });

  } catch (err) {
    console.error("DELETE MENU ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


// ══════════════════════════════════════════════════════════════
// TOGGLE AVAILABILITY
// ══════════════════════════════════════════════════════════════
exports.toggleMenu = async (req, res) => {
  try {
    await db.query(
      "UPDATE menus SET available=? WHERE id=?",
      [req.body.available, req.params.id]
    );
    res.json({ message: "Updated" });

  } catch (err) {
    console.error("TOGGLE MENU ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


// ══════════════════════════════════════════════════════════════
// GET MENUS BY DATE (for customer-facing queries)
// ══════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════
// GET MENUS BY DATE (for customer-facing queries)
// ══════════════════════════════════════════════════════════════
exports.getMenusByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "date query param required" });

    const [menus] = await db.query(
      `SELECT m.*, v.name AS vendor_name, v.address AS vendor_address
       FROM menus m
       JOIN vendors v ON v.id = m.vendor_id
       WHERE m.menu_date = ? AND m.available = 1`,
      [date]
    );

    await attachItems(menus);
    res.json(menus);

  } catch (err) {
    console.error("GET MENUS BY DATE ERROR:", err);
    res.status(500).json({ message: err.message }); // ← err.message will now tell you exactly what's wrong
  }
};

// ✅ DELETE the second duplicate exports.getMenusByDate that was below this


// ══════════════════════════════════════════════════════════════
// GET SUBSCRIPTION PLANS (weekly / monthly) — public
// ══════════════════════════════════════════════════════════════
exports.getSubscriptionPlans = async (req, res) => {
  try {
    const { type, vendor_id } = req.query;

    let sql = `
      SELECT m.*, v.name AS vendor_name, v.address AS vendor_address
      FROM menus m
      JOIN vendors v ON v.id = m.vendor_id
      WHERE m.type IN ('weekly', 'monthly') AND m.available = 1
    `;
    const params = [];

    if (type && ["weekly", "monthly"].includes(type)) {
      sql += " AND m.type = ?";
      params.push(type);
    }
    if (vendor_id) {
      sql += " AND m.vendor_id = ?";
      params.push(vendor_id);
    }

    sql += " ORDER BY m.created_at DESC";

    const [plans] = await db.query(sql, params);
    await attachItems(plans);
    res.json(plans);

  } catch (err) {
    console.error("GET SUBSCRIPTION PLANS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


// ══════════════════════════════════════════════════════════════
// CANCEL / SKIP — Refund Calculation Logic
//
// POST /vendor-menu/menus/:id/cancel
// body: { user_subscription_id, cancel_date, cancel_type }
//       cancel_type: "skip_day" | "full_cancel"
//
// Rules (for a real tiffin mess):
//   skip_day:
//     - 24h+ before delivery  → full credit (1 meal value)
//     - 6–24h before          → 50% credit
//     - <6h before            → no credit
//   full_cancel (monthly):
//     - Before plan starts    → 100% refund
//     - Within 3 days         → prorated (remaining days / total days × price) − ₹49 fee
//     - After 3 days          → prorated − ₹49 fee
// ══════════════════════════════════════════════════════════════
exports.calculateCancelRefund = async (req, res) => {
  try {
    const { id } = req.params;                                 // menu id
    const { cancel_date, cancel_type, delivery_time } = req.body;
    // delivery_time: "HH:MM" 24h format e.g. "13:00" for 1 PM

    const [rows] = await db.query("SELECT * FROM menus WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Menu not found" });

    const menu = rows[0];
    const pricePerMeal = parseFloat(menu.price) || 0;

    if (cancel_type === "skip_day") {
      // Determine how many hours before delivery the request came in
      const cancelDT   = new Date(`${cancel_date}T${delivery_time || "13:00"}:00`);
      const nowDT      = new Date();
      const hoursAhead = (cancelDT - nowDT) / (1000 * 60 * 60);

      let refundAmount = 0;
      let creditPct    = 0;
      let policy       = "";

      if (hoursAhead >= 24) {
        creditPct    = 100;
        refundAmount = pricePerMeal;
        policy       = "Full credit — cancelled 24+ hrs before delivery";
      } else if (hoursAhead >= 6) {
        creditPct    = 50;
        refundAmount = pricePerMeal * 0.5;
        policy       = "50% credit — cancelled 6–24 hrs before delivery";
      } else {
        creditPct    = 0;
        refundAmount = 0;
        policy       = "No credit — cancelled less than 6 hrs before delivery";
      }

      return res.json({
        menu_id:       id,
        cancel_type,
        hours_ahead:   parseFloat(hoursAhead.toFixed(2)),
        price_per_meal: pricePerMeal,
        credit_pct:    creditPct,
        refund_amount: parseFloat(refundAmount.toFixed(2)),
        policy,
      });
    }

    if (cancel_type === "full_cancel") {
      const planStart    = new Date(menu.menu_date);
      const now          = new Date();
      const totalDays    = menu.type === "weekly" ? 7 : 30;
      const daysElapsed  = Math.max(0, Math.floor((now - planStart) / (1000 * 60 * 60 * 24)));
      const daysRemaining = Math.max(0, totalDays - daysElapsed);
      const CANCEL_FEE   = 49;

      let refundAmount = 0;
      let policy       = "";

      if (daysElapsed < 0) {
        // Before plan starts
        refundAmount = parseFloat(menu.price);
        policy       = "Full refund — plan hasn't started yet";
      } else if (daysElapsed <= 3) {
        const perDay  = parseFloat(menu.price) / totalDays;
        refundAmount  = Math.max(0, (perDay * daysRemaining) - CANCEL_FEE);
        policy        = `Prorated refund for ${daysRemaining} remaining days minus ₹${CANCEL_FEE} fee`;
      } else {
        const perDay  = parseFloat(menu.price) / totalDays;
        refundAmount  = Math.max(0, (perDay * daysRemaining) - CANCEL_FEE);
        policy        = `Prorated refund for ${daysRemaining} remaining days minus ₹${CANCEL_FEE} fee`;
      }

      return res.json({
        menu_id:         id,
        cancel_type,
        plan_type:       menu.type,
        total_days:      totalDays,
        days_elapsed:    daysElapsed,
        days_remaining:  daysRemaining,
        original_price:  parseFloat(menu.price),
        cancellation_fee: CANCEL_FEE,
        refund_amount:   parseFloat(refundAmount.toFixed(2)),
        policy,
      });
    }

    return res.status(400).json({ message: "cancel_type must be 'skip_day' or 'full_cancel'" });

  } catch (err) {
    console.error("CANCEL REFUND ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ══════════════════════════════════════════════════════════════
// GET DAILY MENUS FOR USER APP (selected + upcoming dates)
// GET /api/menu?vendorId=3&date=2026-04-27&days=3
// ══════════════════════════════════════════════════════════════
exports.getUserDailyMenus = async (req, res) => {
  try {
    const { vendorId, date, days } = req.query;

    if (!vendorId) {
      return res.status(400).json({ message: "vendorId query param required" });
    }

    const startDate = date || toIsoDate(new Date());
    const rangeDays = Math.max(0, Math.min(Number(days) || 3, 14));
    const endDate = addDays(startDate, rangeDays);

    const [rows] = await db.query(
      `SELECT *
       FROM menus
       WHERE vendor_id = ?
         AND type = 'daily'
         AND COALESCE(available, 1) = 1
         AND menu_date BETWEEN ? AND ?
       ORDER BY menu_date ASC, created_at DESC`,
      [vendorId, startDate, endDate]
    );

    await attachItems(rows);

    const groupedByDate = rows.reduce((acc, menu) => {
      if (!acc[menu.menu_date]) acc[menu.menu_date] = [];
      acc[menu.menu_date].push(menu);
      return acc;
    }, {});

    const availableDates = Object.keys(groupedByDate).sort();
    const resolvedDate = groupedByDate[startDate] ? startDate : (availableDates[0] || null);

    const selectedMenus = resolvedDate ? groupedByDate[resolvedDate] || [] : [];
    const lunch = selectedMenus.find((m) => m.meal_type === "lunch") || null;
    const dinner = selectedMenus.find((m) => m.meal_type === "dinner") || null;

    return res.json({
      requestedDate: startDate,
      resolvedDate,
      availableDates,
      lunch: normalizeUserMenu(lunch),
      dinner: normalizeUserMenu(dinner),
    });
  } catch (err) {
    console.error("GET USER DAILY MENUS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
