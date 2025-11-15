// src/models/user.ts
import { ObjectId } from "mongodb";

export interface IUser {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string; // Hashed password (bcrypt)
  name: string;
  role: string; // 'admin', etc
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserResponse {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

// Helper function untuk convert MongoDB user ke response format
export function userToResponse(user: IUser): IUserResponse {
  return {
    id: user._id?.toString() || "",
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
