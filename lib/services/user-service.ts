import { User, Prisma } from "@/src/generated/prisma";
import { BaseService } from "./base-service";

/**
 * Service for handling user-related operations
 */
export class UserService extends BaseService {
  /**
   * Get user by ID
   * @param id User ID
   */
  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Get user by email
   * @param email User email
   */
  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Get user by wallet address
   * @param walletAddress User wallet address
   */
  async getUserByWalletAddress(walletAddress: string) {
    return this.prisma.user.findUnique({
      where: { walletAddress },
    });
  }

  /**
   * Create a new user
   * @param data User data
   */
  async createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
    });
  }

  /**
   * Update user information
   * @param id User ID
   * @param data User data to update
   */
  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
