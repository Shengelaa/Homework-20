const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql
  .createPool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    database: process.env.SQL_DB,
  })
  .promise();
const blogPool = mysql
  .createPool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    database: process.env.SQL_DB2,
  })
  .promise();

const getAllUsers = async () => {
  const [result] = await pool.query("SELECT * FROM users");
  return result;
};

const getAllBlogs = async () => {
  const [result] = await blogPool.query("SELECT * FROM blogs");
  return result;
};

const getUserById = async (id) => {
  const [result] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
  const user = result[0];
  if (!user) {
    return null;
  }
  const [blogs] = await blogPool.query(
    `SELECT * FROM blogs WHERE user_id = ?`,
    [id]
  );
  user.blog = blogs;
  return user;
};

const createBlog = async (user_id, title, content) => {
  const isValidUser = await getUserById(user_id);
  if (!isValidUser) {
    return undefined;
  }
  const [result] = await blogPool.query(
    `INSERT INTO blogs (user_id, title, content) VALUES (?, ?, ?)`,
    [user_id, title, content]
  );

  return result;
};

const AlreadyUsedEmail = async (email) => {
  const [result] = await pool.query("select * FROM users WHERE email = ?", [
    email,
  ]);

  return result[0];
};

const getUserByIdAndDelete = async (id) => {
  const [userResult] = await pool.query(`SELECT * FROM users WHERE id = ?`, [
    id,
  ]);
  const user = userResult[0];
  if (!user) return null;

  const [blogsResult] = await blogPool.query(
    `SELECT * FROM blogs WHERE user_id = ?`,
    [id]
  );
  user.blog = blogsResult;

  await blogPool.query(`DELETE FROM blogs WHERE user_id = ?`, [id]);

  await pool.query(`DELETE FROM users WHERE id = ?`, [id]);

  return user;
};

const deleteBlog = async (id) => {
  const [blogResult] = await blogPool.query(
    "SELECT * FROM blogs WHERE id = ?",
    [id]
  );

  const blog = blogResult[0];

  if (!blog) {
    console.warn(`No blog found with that id`);
    return null;
  }

  const [deleteResult] = await blogPool.query(
    `DELETE FROM blogs WHERE id = ?`,
    [id]
  );

  return blog;
};

const createUser = async (name, lastname, email) => {
  const [result] = await pool.query(
    `INSERT INTO users (name, lastname, email) VALUES (?, ?, ?)`,
    [name, lastname, email]
  );

  const insertedData = await getUserById(result.insertId);

  return insertedData;
};
const getUserByIdAndUpdate = async (id, name, lastname, email) => {
  const [result] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
  const existingProductValues = result[0];
  const updatedName = name !== undefined ? name : existingProductValues.name;
  const updatedLastName =
    lastname !== undefined ? lastname : existingProductValues.lastname;
  const updatedEmail =
    email !== undefined ? email : existingProductValues.email;
  await pool.query(
    `UPDATE users SET name = ?, lastname = ?, email = ? WHERE id = ?`,
    [updatedName, updatedLastName, updatedEmail, id]
  );

  const [updatedResult] = await pool.query(`SELECT * FROM users WHERE id = ?`, [
    id,
  ]);

  return updatedResult[0];
};

const updateBlog = async (id, title, content) => {
  const [result] = await blogPool.query(`SELECT * FROM blogs WHERE id = ?`, [
    id,
  ]);

  const existingBlogValues = result[0];

  if (!existingBlogValues) {
    console.warn(`No blog found with id ${id}`);
    return { error: "No blog found with the provided ID" };
  }

  const updatedTitle = title !== undefined ? title : existingBlogValues.title;
  const updatedContent =
    content !== undefined ? content : existingBlogValues.content;

  await blogPool.query(`UPDATE blogs SET title = ?, content = ? WHERE id = ?`, [
    updatedTitle,
    updatedContent,
    id,
  ]);

  const [updatedResult] = await blogPool.query(
    `SELECT * FROM blogs WHERE id = ?`,
    [id]
  );

  return updatedResult[0];
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  AlreadyUsedEmail,
  getUserByIdAndDelete,
  getUserByIdAndUpdate,
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
};
