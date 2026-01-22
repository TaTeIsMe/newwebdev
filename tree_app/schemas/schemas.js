const { z } = require("zod");

const TreeSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
}).strict();

const TreeUpdateSchema = TreeSchema.partial().refine(
    data => Object.keys(data).length > 0,
    { message: "Must update at least one field" }
).strict();

const RegistrationSchema = z.object({
  nickname: z.string().min(3, "Username must be at least 3 characters"),
  login: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).strict();

const UpdateUserSchema = z.object({
  nickname: z.string().min(3, { message: "Username must be at least 3 characters" }).optional(),
  login: z.string().min(3, { message: "Username must be at least 3 characters" }).optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
  confirmPassword: z.string().min(6, { message: "Please confirm your password" }).optional(),
}).refine(
  data => (!data.password && !data.confirmPassword) || (data.password === data.confirmPassword),
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
).strict();
const LoginSchema = z.object({
  login: z.string("Invalid login").min(1,{message:"Please enter login"}),
  password: z.string().min(1,{message:"Please enter password"})
}).strict();

const CommentSchema = z.object({
  content: z.string().min(1, "Comment content cannot be empty")
}).strict();

module.exports = {CommentSchema, RegistrationSchema, LoginSchema, TreeSchema, TreeUpdateSchema, UpdateUserSchema}