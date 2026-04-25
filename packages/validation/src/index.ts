import { z } from "zod";

export const UserRegistrationSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name is too short"),
});

export type UserRegistrationInput = z.infer<typeof UserRegistrationSchema>;

export const ProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.number().min(0, "Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
});

export type ProductInput = z.infer<typeof ProductSchema>;
