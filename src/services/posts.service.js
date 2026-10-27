const prisma = require("../db");

const createPost = async (data) => {
  return await prisma.post.create({
    data,
  });
};

const listPosts = async ({ page = 1, limit = 10, sortBy = "createdAt", order = "desc", location, search, from, to } = {}) => {
  const where = {};
  if (location) {
    where.location = {
      equals: location,
      mode: "insensitive",
    };
  }
  if (search) {
    where.caption = {
      contains: search,
      mode: "insensitive",
    };
  }
  if (from || to) {
    where.createdAt = {};
    if (from) {
      where.createdAt.gte = from;
    }
    if (to) {
      where.createdAt.lt = to;
    }
  }

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: {
        [sortBy]: order,
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};
const getPostById = async (id) => {
  return await prisma.post.findUnique({
    where: { id },
  });
};
const updatePost = async (id, data) => {
  return await prisma.post.update({
    where: { id },
    data,
  });
};
const deletePost = async (id) => {
  return await prisma.post.delete({
    where: { id },
  });
};

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
};
