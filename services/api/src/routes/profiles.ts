import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';

const prisma = new PrismaClient();
export const profilesRouter = Router();

profilesRouter.get('/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const profile = await prisma.profile.findUnique({
      where: { username },
      include: { links: { orderBy: { order: 'asc' } } },
    });
    if (!profile) return res.status(404).json({ error: 'Not found' });
    return res.json(profile);
  } catch {
    return res.status(500).json({ error: 'Failed to load profile' });
  }
});

const updateProfileSchema = z.object({
  displayName: z.string().min(1).optional(),
  bio: z.string().max(1000).optional(),
  avatarUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  theme: z.string().optional(),
  primaryEmail: z.string().email().optional(),
  phone: z.string().optional(),
  leadFormEnabled: z.boolean().optional(),
});

profilesRouter.patch('/me', requireAuth, async (req, res) => {
  const userId = (req as any).user.id as string;
  const parse = updateProfileSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  try {
    const profile = await prisma.profile.update({
      where: { userId },
      data: parse.data,
    });
    return res.json(profile);
  } catch {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

const createLinkSchema = z.object({ title: z.string().min(1), url: z.string().url() });

profilesRouter.post('/me/links', requireAuth, async (req, res) => {
  const userId = (req as any).user.id as string;
  const parse = createLinkSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  try {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const last = await prisma.link.findFirst({ where: { profileId: profile.id }, orderBy: { order: 'desc' } });
    const order = (last?.order || 0) + 1;
    const link = await prisma.link.create({ data: { profileId: profile.id, title: parse.data.title, url: parse.data.url, order } });
    return res.status(201).json(link);
  } catch {
    return res.status(500).json({ error: 'Failed to create link' });
  }
});

const updateLinkSchema = z.object({ title: z.string().min(1).optional(), url: z.string().url().optional(), order: z.number().int().optional() });

profilesRouter.patch('/me/links/:id', requireAuth, async (req, res) => {
  const userId = (req as any).user.id as string;
  const { id } = req.params;
  const parse = updateLinkSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  try {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const link = await prisma.link.update({ where: { id }, data: parse.data });
    if (link.profileId !== profile.id) return res.status(403).json({ error: 'Forbidden' });
    return res.json(link);
  } catch {
    return res.status(500).json({ error: 'Failed to update link' });
  }
});

profilesRouter.delete('/me/links/:id', requireAuth, async (req, res) => {
  const userId = (req as any).user.id as string;
  const { id } = req.params;
  try {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const link = await prisma.link.delete({ where: { id } });
    if (link.profileId !== profile.id) return res.status(403).json({ error: 'Forbidden' });
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Failed to delete link' });
  }
});

const leadSchema = z.object({ name: z.string().min(1), email: z.string().email(), message: z.string().max(2000).optional(), source: z.string().optional() });

profilesRouter.post('/:username/lead', async (req, res) => {
  const { username } = req.params;
  const parse = leadSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  try {
    const profile = await prisma.profile.findUnique({ where: { username } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const lead = await prisma.lead.create({ data: { profileId: profile.id, ...parse.data } });
    return res.status(201).json(lead);
  } catch {
    return res.status(500).json({ error: 'Failed to submit lead' });
  }
});
