// routes/fix.js
const express = require('express');
const router = express.Router();
const Category = require('../models/Category'); // adjust path if needed

// Temporary route to migrate subCategories -> subcategories
router.get('/fix-subcategories', async (req, res) => {
  try {
    await Category.updateMany(
      { subCategories: { $exists: true } },
      [
        { $set: { subcategories: "$subCategories" } },
        { $unset: "subCategories" }
      ]
    );
    res.send('Subcategories fixed successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fix subcategories');
  }
});

module.exports = router;
