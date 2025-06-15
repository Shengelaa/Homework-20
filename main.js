const express = require("express");
const {
  getAllUsers,
  getUserById,
  createUser,
  AlreadyUsedEmail,
  getUserByIdAndDelete,
  getUserByIdAndUpdate,

  createBlog,
  updateBlog,
  deleteBlog,
} = require("./config/connectToSQL");

const app = express();
app.use(express.json());
app.get("/users", async (req, res) => {
  const resp = await getAllUsers();
  res.json(resp);
});

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const result = await getUserById(id);

  if (!result) {
    res.status(404).json("No user found with matching id");
    return;
  }
  res.json(result);
});

app.post("/users", async (req, res) => {
  console.log("recieved body ", req.body);
  const { name, lastname, email } = req.body;
  if (!name || !lastname || !email) {
    res.status(400).json({ error: "give required fields" });
    return;
  }

  const check = await AlreadyUsedEmail(email);
  if (check !== undefined) {
    res
      .status(400)
      .json({ message: "User with this kind of email already exists!" });
    return;
  }
  const result = await createUser(name, lastname, email);
  console.log(result);
  res.status(201).json({ message: "created successfully" });
});

app.post("/blogs", async (req, res) => {
  const { user_id, title, content } = req.body;

  if (!user_id || !title || !content) {
    return res
      .status(400)
      .json({ message: "Give all Required Fields to create a blog" });
  }
  const validUser = await getUserById(user_id);
  if (!validUser) {
    res.status(404).json({ message: "No such User found with that Id" });
    return;
  }

  const result = await createBlog(user_id, title, content);
  console.log(result);
  res.status(201).json({ message: "New Blog Created Successfully" });
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  const result = await getUserByIdAndDelete(id);

  if (!result) {
    res.status(404).json("No User found with matching id");
    return;
  }
  res.json(result);
});

app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, lastname, email } = req.body;
  console.log(name);
  console.log(lastname);
  console.log(email);
  const result = await getUserByIdAndUpdate(id, name, lastname, email);
  res.json({
    message: "User updated successfully",
    user: result,
  });
});

app.put("/blogs/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  const updatedBlog = await updateBlog(id, title, content);

  if (!updatedBlog || updatedBlog.error) {
    return res
      .status(404)
      .json({ message: "No blog found with the provided ID" });
  }

  res.status(200).json({
    message: "Blog updated successfully",
    blog: updatedBlog,
  });
});

app.delete("/blogs/:id", async (req, res) => {
  const { id } = req.params;

  const deletedBlog = await deleteBlog(id);

  if (!deletedBlog) {
    return res
      .status(404)
      .json({ message: "Blog not found with the provided ID" });
  }

  res.status(200).json({
    message: "Blog deleted successfully",
    deletedBlog,
  });
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});
