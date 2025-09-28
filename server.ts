import express from "express";
import z, { json } from "zod";

const app = express();
const PORT = 3000;

app.use(express.json());

let pastries = [
  {
    id: 1,
    name: "Semla",
    category: ["bun", "seasonal", "filled"],
  },
  {
    id: 2,
    name: "Chokladboll",
  },
  {
    id: 3,
    name: "Prinsesstårta",
    category: ["cake", "filled"],
  },
];

const PastrySchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.array(z.string()).optional(),
});
const PastriesSchema = z.array(PastrySchema);

app.get("/selection", (req, res) => {
  const validatePastires = PastriesSchema.safeParse(pastries);
  if (!validatePastires.success) {
    return res.json({ error: validatePastires.error });
  }
  res.json({ pastries });
});

app.post("/selection", (req, res) => {
  const newPastry = {
    id: pastries.length + 1,
    name: req.body.name,
    category: req.body.category,
  };
  const validatePastry = PastrySchema.safeParse(newPastry);
  if (!validatePastry.success) {
    return res.status(400).json({ error: validatePastry.error });
  }
  pastries.push(newPastry);
  res
    .status(201)
    .json({ message: "Entry successfull added!", pastry: newPastry });
});

app.delete("/selection/:id", (req, res) => {
  const pastryId = parseInt(req.params.id);
  if (pastries[pastryId] === undefined) {
    return res.status(404).json({ Error: "Entry not found." });
  }
  pastries = pastries.filter((p) => p.id !== pastryId);
  res.json({ Message: "Entry successfully deleted!" });
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
    category: req.body.category || pastry.category,
  };
  const validateUpdate = PastrySchema.safeParse(updateInput);
  if (!validateUpdate.success) {
    return res
      .status(400)
      .json({ message: "Invalid input.", error: validateUpdate.error });
  }
  pastry.name = updateInput.name;
  pastry.category = updateInput.category;
  res
    .status(201)
    .json({ message: "Entry successfully updated", update: pastry });
});

app.listen(PORT, () => {
  console.log(`Server is live on http://localhost:${PORT}`);
});
