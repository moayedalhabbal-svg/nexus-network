import { z } from "zod";

export const profileSchema = z.object({
  username: z.string().min(3).max(50),
  full_name: z.string().min(2).max(100),
  headline: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  search_visibility: z.boolean().default(true),
});

export const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  pitch: z.string().min(10, "Pitch must be at least 10 characters").max(200),
  description: z.string().min(20, "Description is too short"),
  stage: z.enum(['idea', 'validation', 'prototype', 'mvp', 'early_traction', 'growth']),
  category: z.string().min(2),
  is_private: z.boolean().default(false),
});

export const applicationSchema = z.object({
  project_id: z.string().uuid(),
  need_id: z.string().uuid(),
  message: z.string().min(20, "Please provide a more detailed pitch (at least 20 characters).").max(1000),
});

export const postSchema = z.object({
  content: z.string().min(1, "Post cannot be empty").max(2000),
  project_ref: z.string().uuid().optional().nullable(),
});
