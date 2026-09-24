import { customerMenu } from "./data.js";

// Maps the words customers use to the allergen names stored in the menu data.
const ALLERGEN_ALIASES = {
  milk: ["milk"], dairy: ["milk"], lactose: ["milk"],
  egg: ["eggs"], eggs: ["eggs"],
  wheat: ["wheat"], gluten: ["wheat"],
  peanut: ["peanuts"], peanuts: ["peanuts"],
  almond: ["almonds"], almonds: ["almonds"],
  walnut: ["walnuts"], walnuts: ["walnuts"],
  pecan: ["pecans"], pecans: ["pecans"],
  "tree nut": ["almonds", "walnuts", "pecans"], "tree nuts": ["almonds", "walnuts", "pecans"],
  nut: ["peanuts", "almonds", "walnuts", "pecans"], nuts: ["peanuts", "almonds", "walnuts", "pecans"],
  banana: ["banana"], bananas: ["banana"],
};

const expandAllergens = terms => [
  ...new Set(terms.flatMap(term => {
    const key = term.trim().toLowerCase();
    return ALLERGEN_ALIASES[key] ?? [key];
  })),
];

const findSafeItems = ({ avoidAllergens, requiredDietary }) => {
  const avoid = expandAllergens(avoidAllergens);
  const required = requiredDietary.map(d => d.trim().toLowerCase()).filter(Boolean);
  const menu = customerMenu().filter(item => item.availableNow);

  return {
    allergensChecked: avoid,
    dietaryRequired: required,
    safeItems: menu
      .filter(item => item.allergens !== null)
      .filter(item => !item.allergens.some(a => avoid.includes(a)))
      .filter(item => required.every(d => item.dietary.includes(d)))
      .map(({ name, price, allergens, dietary }) => ({ name, price, listedAllergens: allergens, dietary })),
    itemsWithoutAllergenData: menu.filter(item => item.allergens === null).map(item => item.name),
  };
};

export default {
  id: "nutritional_allergy",
  name: "NutritionalAllergyAgent",
  label: "Nutritional & Allergy Agent",
  role: "customer",
  description:
    "Allergy and dietary guidance: finds treats without specific allergens (nuts, peanuts, dairy, gluten, eggs) or that meet dietary needs (vegan, vegetarian), and answers what allergens an item lists.",
  instructions: `You help customers with allergies and dietary needs. Safety comes first.
- To suggest safe treats, always call find_safe_menu_items and recommend only items from its safeItems. Never judge safety yourself.
- If the customer hasn't said which allergen or diet matters, ask before suggesting anything.
- To answer what is in a specific item, use its allergens list in the menu. If allergens is null, say the allergen information isn't on file.
- Never call an item "allergen-free" or guarantee it is safe. Say the item does not list that allergen.
- Always end by advising customers with severe allergies to confirm with bakery staff before ordering.`,
  async buildContext() {
    return { menu: customerMenu() };
  },
  tools: [
    {
      name: "find_safe_menu_items",
      description: "Returns in-season menu items whose listed allergens avoid all the given allergens and that meet every required dietary label.",
      parameters: {
        type: "object",
        properties: {
          avoidAllergens: {
            type: "array",
            items: { type: "string" },
            description: "Allergens to avoid, such as peanuts, tree nuts, dairy, gluten, eggs. Use an empty array if none.",
          },
          requiredDietary: {
            type: "array",
            items: { type: "string" },
            description: "Dietary labels every item must have, such as vegan or vegetarian. Use an empty array if none.",
          },
        },
        required: ["avoidAllergens", "requiredDietary"],
        additionalProperties: false,
      },
      handler: findSafeItems,
    },
  ],
};
