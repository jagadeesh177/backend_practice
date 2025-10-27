const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

let feedbacks = [];

app.post("/api/feedback", (req, res) => {
  const { restaurantName, location, feedbackText, score, tags } = req.body;

  if (!restaurantName || !location || !feedbackText || score === undefined) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (score < 1 || score > 5) {
    return res.status(400).json({ error: "Score must be between 1 and 5" });
  }

  const duplicate = feedbacks.find(
    (f) => f.restaurantName === restaurantName && f.location === location
  );
  if (duplicate) {
    return res.status(400).json({ error: "Feedback already exists for this restaurant" });
  }

  const newFeedback = {
    id: Date.now(),
    restaurantName,
    location,
    feedbackText,
    score,
    tags: tags || [],
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  feedbacks.push(newFeedback);
  res.status(201).json({ message: "Feedback added!", data: newFeedback });
});

app.get("/api/feedback", (req, res) => {
  const { restaurantName, score, status, sortBy, order } = req.query;
  let results = [...feedbacks];

  if (restaurantName) {
    results = results.filter((f) => f.restaurantName === restaurantName);
  }
  if (score) {
    results = results.filter((f) => f.score == score);
  }
  if (status) {
    results = results.filter((f) => f.status === status);
  }

  if (sortBy === "score" || sortBy === "date") {
    results.sort((a, b) => {
      const valA = sortBy === "date" ? new Date(a.createdAt) : a[sortBy];
      const valB = sortBy === "date" ? new Date(b.createdAt) : b[sortBy];
      return order === "asc" ? valA - valB : valB - valA;
    });
  }

  res.json(results);
});

app.put("/api/feedback/:id", (req, res) => {
  const { id } = req.params;
  const { feedbackText, score, tags } = req.body;

  const feedback = feedbacks.find((f) => f.id == id);
  if (!feedback) return res.status(404).json({ error: "Feedback not found" });

  if (score && (score < 1 || score > 5)) {
    return res.status(400).json({ error: "Score must be between 1 and 5" });
  }

  if (feedbackText) feedback.feedbackText = feedbackText;
  if (score) feedback.score = score;
  if (tags) feedback.tags = tags;

  res.json({ message: "Feedback updated!", data: feedback });
});

app.delete("/api/feedback/:id", (req, res) => {
  const { id } = req.params;
  const index = feedbacks.findIndex((f) => f.id == id);
  if (index === -1) return res.status(404).json({ error: "Feedback not found" });

  feedbacks.splice(index, 1);
  res.json({ message: "Feedback deleted successfully" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
