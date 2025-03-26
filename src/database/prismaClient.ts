import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

// Prisma Client Extension for Hashing Passwords
export const extendedPrisma = prisma.$extends({
  query: {
    user: {
      async create({ args, query }) {
        if (args.data.password) {
          args.data.password = await bcrypt.hash(args.data.password, SALT_ROUNDS);
        }
        return query(args); // Execute the original query
      },
      async update({ args, query }) {
        if (args.data.password) {
          if (typeof args.data.password === "string") {
            args.data.password = await bcrypt.hash(args.data.password, SALT_ROUNDS);
          }
        }
        return query(args);
      },
    },
  },
});

export default extendedPrisma;
