import argon2 from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const users = [
  {
    username: "admin",
    email: "admin@example.com",
  },
  {
    username: "Kareem Ahmed",
    email: "kemoahmedahmedkemo@gmail.com",
  },
];

const tickets = [
  {
    title:
      "This is a very long ticket title that should definitely be truncated when the screen gets narrow",
    content:
      "This is the first ticket with a much longer description that should demonstrate the line clamping behavior when the content gets too long to fit in the available space.",
    status: "OPEN" as const,
    bounty: 399, //3.99$
    deadline: new Date().toISOString().split("T")[0],
  },
  {
    title:
      "Another extremely long ticket title that will test our truncation implementation",
    content:
      "This is the second ticket with an even longer description to test how well our line clamping works in various scenarios and screen sizes.",
    status: "IN_PROGRESS" as const,
    bounty: 599, //5.99$
    deadline: new Date().toISOString().split("T")[0],
  },
  {
    title:
      "This is a very long ticket title that should definitely be truncated when the screen gets narrow",
    content:
      "This is the first ticket with a much longer description that should demonstrate the line clamping behavior when the content gets too long to fit in the available space.",
    status: "DONE" as const,
    bounty: 999, //9.99$
    deadline: new Date().toISOString().split("T")[0],
  },
];

const comments = [
  {
    content: "This is a first comment",
    ticketId: "1",
  },
  {
    content: "This is a second comment",
    ticketId: "2",
  },
  {
    content: "This is a third comment",
    ticketId: "3",
  },
];

const seed = async () => {
  console.log("Seeding database...");

  const start = performance.now();
  // Delete all users
  await prisma.user.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.ticketComment.deleteMany();

  const passwordHash = await argon2.hash("password");

  prisma.$transaction(async (tx) => {
    // Create users
    const createdUsers = await tx.user.createManyAndReturn({
      data: users.map((user) => ({
        ...user,
        passwordHash,
      })),
    });

    // Create tickets
    const createdTickets = await tx.ticket.createManyAndReturn({
      data: tickets.map((ticket) => ({
        ...ticket,
        userId: createdUsers[0].id,
      })),
    });

    // Create comments
    await tx.ticketComment.createMany({
      data: comments.map((comment) => ({
        ...comment,
        ticketId: createdTickets[0].id,
        userId: createdUsers[1].id,
      })),
    });
  });

  const end = performance.now();
  console.log(`Database seeded successfully in ${(end - start).toFixed(2)}ms`);
};

seed();
