import { PrismaClient } from "@/src/generated/prisma";
import { prisma } from "../prisma";

export class BaseService {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }
}
