const prisma = require("../db");

const createUser = async (data) => {
  return await prisma.user.create({
    data,
  });
};

const listUsers = async ({ page = 1, limit = 10, sortBy = "createdAt", order = "desc", isPrivate, search } = {}) => {
  const where = {};

  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate;
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { fullname: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: {
        [sortBy]: order,
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
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
const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};
const updateUser = async (id, data) => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};
const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id },
  });
};

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
