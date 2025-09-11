import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

const seed = async () => {
  console.log("Seeding database...");
  const start = performance.now();
  await prisma.ticket.deleteMany();
  await prisma.ticket.createMany({
    data: tickets,
  });
  const end = performance.now();
  console.log(`Database seeded successfully in ${(end - start).toFixed(2)}ms`);
};

seed();
