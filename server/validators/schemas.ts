import { z } from 'zod';

// Reusable parts
const divisionEnum = z.enum(['artifacts', '3d', 'code']);
const licenseEnum = z.enum(['ORP_BEAVER', 'ORP_EAGLE', 'ORP_KANGAROO']);
const typeEnum = z.enum(['book', 'research_paper', 'magazine', 'poster', 'other', '3d_artifact', 'code_gist']);
const priorityEnum = z.enum(['low', 'normal', 'high', 'urgent']);

// Publications
export const createPublicationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  subtitle: z.string().max(600).optional(),
  abstract: z.string().optional(),
  type: typeEnum,
  license: licenseEnum,
  division: divisionEnum.default('artifacts'),
  publisherId: z.string().optional(),
  fileStorageKey: z.string().optional(),
  extraFiles: z.string().optional(), // JSON array string
  coverStorageKey: z.string().optional(),
  customThumbnailStorageKey: z.string().optional(),
  githubRepoUrl: z.string().url().optional().or(z.literal('')),
  threejsModelKey: z.string().optional(),
  tags: z.string().optional(),
  communities: z.string().optional(),
  links: z.string().optional(),
  codeSnippet: z.string().optional(),
  primaryLanguage: z.string().optional(),
  previewStorageKey: z.string().optional(),
});

export const updatePublicationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  abstract: z.string().min(50).optional(),
  tags: z.string().optional(),
});

// Cases
export const createCaseSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(255, 'Subject is too long'),
  priority: priorityEnum.default('normal'),
  relatedPubId: z.string().optional(),
  initialMessage: z.string().min(1, 'Message is required'),
});

export const createCaseMessageSchema = z.object({
  body: z.string().min(1, 'Message is required'),
});

// Users
export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(255).optional(),
});
