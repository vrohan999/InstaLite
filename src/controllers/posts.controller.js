const postsService = require("../services/posts.service");

const create = async (req, res) => {
  try {
    const { imageUrl, caption, location } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL is required" });
    }

    const data = {
      imageUrl,
    };

    if (caption !== undefined) {
      data.caption = caption;
    }
    if (location !== undefined) {
      data.location = location;
    }

    const post = await postsService.createPost(data);
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
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
    const allowedSortBy = ["createdAt", "updatedAt"];
    if (!allowedSortBy.includes(sortBy)) {
      return res.status(400).json({ error: "Invalid sort field. Allowed values: createdAt, updatedAt" });
    }

    const order = req.query.order || "desc";
    const allowedOrder = ["asc", "desc"];
    if (!allowedOrder.includes(order)) {
      return res.status(400).json({ error: "Sort order must be 'asc' or 'desc'" });
    }

    let from;
    if (req.query.from !== undefined) {
      const fromDate = new Date(req.query.from);
      if (isNaN(fromDate.getTime())) {
        return res.status(400).json({ error: "'from' and 'to' must be valid date strings" });
      }
      from = fromDate;
    }

    let to;
    if (req.query.to !== undefined) {
      const toDate = new Date(req.query.to);
      if (isNaN(toDate.getTime())) {
        return res.status(400).json({ error: "'from' and 'to' must be valid date strings" });
      }
      to = toDate;
    }

    const { location, search } = req.query;

    const result = await postsService.listPosts({
      page,
      limit,
      sortBy,
      order,
      location,
      search,
      from,
      to,
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
      return res.status(404).json({ error: "No post found with the given ID" });
    }

    const post = await postsService.getPostById(id);
    if (!post) {
      return res.status(404).json({ error: "No post found with the given ID" });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong. Please try again later" });
  }
};

const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(404).json({ error: "No post found with the given ID" });
    }

    const { caption, location } = req.body;
    const data = {};

    if (caption !== undefined) {
      data.caption = caption;
    }
    if (location !== undefined) {
      data.location = location;
    }

    const post = await postsService.updatePost(id, data);
    res.status(200).json(post);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "No post found with the given ID" });
    }
    res.status(500).json({ error: "Something went wrong. Please try again later" });
  }
};

const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(404).json({ error: "No post found with the given ID" });
    }

    await postsService.deletePost(id);
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "No post found with the given ID" });
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

