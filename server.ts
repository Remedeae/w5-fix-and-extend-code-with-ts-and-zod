import express from "express";
import z, { json } from "zod";

const app = express();
const PORT = 3000;

app.use(express.json());

let pastries = [
  {
    id: 1,
    name: "Semla",
    price: {
      price: 35,
      currency: "sek",
    },
  },
  {
    id: 2,
    name: "Chokladboll",
    price: {
      price: 20,
    },
  },
  {
    id: 3,
    name: "Prinsesstårta",
    price: {
      price: 89,
      currency: "sek",
    },
  },
];

const PastrySchema = z.object({
  id: z.number().min(1),
  name: z.string(),
  price: z.object({
    price: z.number().positive(),
    currency: z.string().optional().default("sek"),
  }),
});
const PastriesSchema = z.array(PastrySchema);

app.get("/selection", (req, res) => {
  const validatePastires = PastriesSchema.safeParse(pastries);
  if (!validatePastires.success) {
    return res.status(500).json({ error: validatePastires.error });
  }
  res.json({ message: validatePastires.data });
});

app.post("/selection", (req, res) => {
  const newPastry = {
    id: pastries.length + 1,
    name: req.body.name,
    price: {
      price: req.body.price.price,
      currency: req.body.price.currency,
    },
  };
  const validatePastry = PastrySchema.safeParse(newPastry);
  if (!validatePastry.success) {
    return res.status(500).json({ error: validatePastry.error });
  }
  pastries.push(validatePastry.data);
  res
    .status(201)
    .json({ message: "Entry successfull added!", pastry: validatePastry.data });
});

app.delete("/selection/:id", (req, res) => {
  const pastryId = parseInt(req.params.id);
  if (pastries[pastryId] === undefined) {
    return res.status(404).json({ Error: "Entry not found." });
  }
  pastries = pastries.filter((p) => p.id !== pastryId);
  res.status(201).json({ Message: "Entry successfully deleted!" });
});

app.put("/selection/:id", (req, res) => {
  const pastryId = parseInt(req.params.id);
  const pastry = pastries.find((p) => p.id === pastryId);
  if (!pastry) {
    return res.status(404).json({ Error: "Entry not found." });
  }
  const updateInput = {
    id: pastryId,
    name: req.body.name || pastry.name,
    price: {
      price: req.body.price.price || pastry.price.price,
      currency: req.body.price.currency || pastry.price.currency,
    },
  };
  const validateUpdate = PastrySchema.safeParse(updateInput);
  if (!validateUpdate.success) {
    return res
      .status(500)
      .json({ message: "Invalid input.", error: validateUpdate.error });
  }
  pastry.name = validateUpdate.data.name;
  pastry.price = validateUpdate.data.price;
  res
    .status(201)
    .json({ message: "Entry successfully updated", update: pastry });
});

app.listen(PORT, () => {
  console.log(`Server is live on http://localhost:${PORT}`);
});
