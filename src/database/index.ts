import {PrismaClient} from "@prisma/client"
import prisma from "./prismaClient";


const prima=new PrismaClient();
const DBConnection=async()=>{
    try {
      await prisma.$connect();
      console.log("Database Connected Successfully");
      
    } catch (error) {
        console.log(`mysql connection failed ${error}`);
        process.exit(1);
    }
}
// Gracefully disconnect Prisma on process exit
process.on("SIGINT", async () => {
    await prisma.$disconnect();
    console.log(" Prisma disconnected. Exiting process.");
    process.exit(0);
  });
  
export {DBConnection}