const prisma = require("../src/db");
const { users, posts } = require("./seed-data");

async function main() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const userResult = await prisma.user.createMany({
    data: users,
  });

  const postResult = await prisma.post.createMany({
    data: posts,
  });

  console.log(`Seeded ${userResult.count} users and ${postResult.count} posts`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });