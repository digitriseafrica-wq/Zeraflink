import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import crypto from 'crypto';

const prisma = new PrismaClient();
export const analyticsRouter = Router();

const profileViewSchema = z.object({ username: z.string().min(1) });

analyticsRouter.post('/profile-view', async (req, res) => {
  const parse = profileViewSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  try {
    const profile = await prisma.profile.findUnique({ where: { username: parse.data.username } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') as string;
    const ipHash = ip ? crypto.createHash('sha256').update(ip).digest('hex') : null;
    await prisma.profileView.create({ data: { profileId: profile.id, userAgent: req.headers['user-agent'] || null, referrer: req.headers.referer as string | undefined, ipHash: ipHash || undefined } });
    return res.status(201).json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Failed to record view' });
  }
});

const linkClickSchema = z.object({ linkId: z.string().min(1) });

analyticsRouter.post('/link-click', async (req, res) => {
  const parse = linkClickSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  try {
    await prisma.linkClick.create({ data: { linkId: parse.data.linkId, userAgent: req.headers['user-agent'] || null, referrer: req.headers.referer as string | undefined } });
    return res.status(201).json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Failed to record click' });
  }
});
