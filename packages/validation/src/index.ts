import { z } from "zod";

export const UserRegistrationSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name is too short"),
});

export type UserRegistrationInput = z.infer<typeof UserRegistrationSchema>;
