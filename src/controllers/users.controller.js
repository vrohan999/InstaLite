const usersService = require("../services/users.service");

const create = async (req, res) => {
  try {
    const { username, email, fullname, bio } = req.body;

    if (!username || !email || !fullname) {
      return res.status(400).json({ error: "username, email, and full name are required" });
    }

    const data = {
      username,
      email,
      fullname,
    };

    if (bio !== undefined) {
      data.bio = bio;
    }

    const user = await usersService.createUser(data);
    res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "That username or email is already taken" });
    }
    res.status(500).json({ error: "Something went wrong. Please try again later" });
  }
};

const list = async (req, res) => {
  try {
    let page = 1;
    let limit = 10;

    if (req.query.page !== undefined) {
      if (!/^[1-9]\d*$/.test(req.query.page)) {
        return res.status(400).json({ error: "'page' and 'limit' must be positive integers" });
      }
      page = parseInt(req.query.page);
    }

    if (req.query.limit !== undefined) {
      if (!/^[1-9]\d*$/.test(req.query.limit)) {
        return res.status(400).json({ error: "'page' and 'limit' must be positive integers" });
      }
      limit = parseInt(req.query.limit);
      if (limit > 50) {
        limit = 50;
      }
    }

    const sortBy = req.query.sortBy || "createdAt";
    const allowedSortBy = ["createdAt", "username", "fullname"];
    if (!allowedSortBy.includes(sortBy)) {
      return res.status(400).json({ error: "Invalid sort field. Allowed values: createdAt, username, fullname" });
    }

    const order = req.query.order || "desc";
    const allowedOrder = ["asc", "desc"];
    if (!allowedOrder.includes(order)) {
      return res.status(400).json({ error: "Sort order must be 'asc' or 'desc'" });
    }

    let isPrivate;
    if (req.query.isPrivate !== undefined) {
      if (req.query.isPrivate === "true") {
        isPrivate = true;
      } else if (req.query.isPrivate === "false") {
        isPrivate = false;
      } else {
        return res.status(400).json({ error: "isPrivate must be 'true' or 'false'" });
      }
    }

    const { search } = req.query;

    const result = await usersService.listUsers({
      page,
      limit,
      sortBy,
      order,
      isPrivate,
      search,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong. Please try again later" });
  }
};

const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(404).json({ error: "No user found with the given ID" });
    }

    const user = await usersService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "No user found with the given ID" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong. Please try again later" });
  }
};

const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(404).json({ error: "No user found with the given ID" });
    }

    const { fullname, bio, isPrivate } = req.body;
    const data = {};

    if (fullname !== undefined) {
      data.fullname = fullname;
    }
    if (bio !== undefined) {
      data.bio = bio;
    }
    if (isPrivate !== undefined) {
      data.isPrivate = isPrivate;
    }

    const user = await usersService.updateUser(id, data);
    res.status(200).json(user);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "No user found with the given ID" });
    }
    res.status(500).json({ error: "Something went wrong. Please try again later" });
  }
};

const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(404).json({ error: "No user found with the given ID" });
    }

    await usersService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "No user found with the given ID" });
    }
    res.status(500).json({ error: "Something went wrong. Please try again later" });
  }
};

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
};

