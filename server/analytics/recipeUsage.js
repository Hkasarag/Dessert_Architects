// PLANNING ASSUMPTIONS, not measured recipes.
// Approximate ingredient used per unit sold, keyed by the sales CSV's ProductID.
// Units match src/data/IngredientProducts.ts (lbs, oz, dozen, gallons).
// Replace these with real recipe yields to make the restock estimates exact.

const COOKIE = {
  "All-Purpose Flour": 0.06, "Unsalted Butter": 0.03, "Granulated Sugar": 0.025,
  "Brown Sugar": 0.02, "Large Eggs": 0.02, "Vanilla Extract": 0.05,
};
const CUPCAKE = {
  "Cake Flour": 0.05, "Unsalted Butter": 0.025, "Granulated Sugar": 0.03,
  "Large Eggs": 0.04, "Whole Milk": 0.005, "Vanilla Extract": 0.05,
};
const BROWNIE = {
  "All-Purpose Flour": 0.03, "Unsalted Butter": 0.035, "Granulated Sugar": 0.04,
  "Large Eggs": 0.03, "Cocoa Powder": 0.02, "Chocolate Chunks": 0.02,
};

const withExtras = (base, extras) => ({ ...base, ...extras });

export const RECIPE_USAGE = {
  "CK-001": withExtras(COOKIE, { "Chocolate Chips": 0.03 }),
  "CK-002": withExtras(COOKIE, { "Cinnamon": 0.05 }),
  "CK-003": withExtras(COOKIE, { "Rolled Oats": 0.03, "Cinnamon": 0.02 }),
  "CK-004": withExtras(COOKIE, { "Chocolate Chunks": 0.03 }),
  "CK-005": withExtras(COOKIE, { "Ginger": 0.05, "Molasses": 0.004, "Cinnamon": 0.03, "Nutmeg": 0.01 }),
  "CK-006": withExtras(COOKIE, { "Almond Extract": 0.05, "Cocoa Powder": 0.01 }),
  "CK-007": withExtras(COOKIE, { "Peach Filling": 0.03 }),
  "CP-001": withExtras(CUPCAKE, { "Vanilla Extract": 0.1 }),
  "CP-002": withExtras(CUPCAKE, { "Cocoa Powder": 0.015 }),
  "CP-003": CUPCAKE,
  "CP-004": withExtras(CUPCAKE, { "Cream Cheese": 0.03, "Cinnamon": 0.03, "Nutmeg": 0.01 }),
  "CP-005": withExtras(CUPCAKE, { "Cocoa Powder": 0.015, "Peppermint Extract": 0.03 }),
  "CP-006": CUPCAKE,
  "CP-007": withExtras(CUPCAKE, { "Blueberries": 0.04 }),
  "BR-001": BROWNIE,
  "BR-002": BROWNIE,
  "BR-003": withExtras(BROWNIE, { "Peppermint Extract": 0.03 }),
  "BR-004": withExtras(BROWNIE, { "Pumpkin Puree": 0.05, "Cinnamon": 0.03, "Nutmeg": 0.01 }),
  "BR-005": withExtras(BROWNIE, { "Strawberries": 0.04, "White Chocolate Chips": 0.02 }),
  "BR-006": withExtras(BROWNIE, { "Cookie Crumbs": 0.02 }),
  "CR-001": {
    "Bread Flour": 0.08, "Unsalted Butter": 0.03, "Brown Sugar": 0.03, "Cinnamon": 0.08,
    "Cream Cheese": 0.02, "Whole Milk": 0.006, "Large Eggs": 0.02,
  },
  "MF-001": { "All-Purpose Flour": 0.05, "Brown Sugar": 0.03, "Cinnamon": 0.02 },
};
