import { Router } from 'express';
import { PrismaClient, DeviceMode } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';

const prisma = new PrismaClient();
export const devicesRouter = Router();

const assignSchema = z.object({ uid: z.string().min(4) });

devicesRouter.post('/assign', requireAuth, async (req, res) => {
  const userId = (req as any).user.id as string;
  const parse = assignSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  try {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const device = await prisma.device.upsert({
      where: { uid: parse.data.uid },
      update: { profileId: profile.id },
      create: { uid: parse.data.uid, profileId: profile.id },
    });
    return res.json(device);
  } catch {
    return res.status(500).json({ error: 'Failed to assign device' });
  }
});

const updateDeviceSchema = z.object({ mode: z.nativeEnum(DeviceMode).optional(), directLinkUrl: z.string().url().nullable().optional() });

devicesRouter.patch('/:uid', requireAuth, async (req, res) => {
  const userId = (req as any).user.id as string;
  const { uid } = req.params;
  const parse = updateDeviceSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  try {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const device = await prisma.device.update({ where: { uid }, data: parse.data });
    if (device.profileId !== profile.id) return res.status(403).json({ error: 'Forbidden' });
    return res.json(device);
  } catch {
    return res.status(500).json({ error: 'Failed to update device' });
  }
});

devicesRouter.get('/:uid/resolve', async (req, res) => {
  const { uid } = req.params;
  try {
    const device = await prisma.device.findUnique({ where: { uid }, include: { profile: true } });
    if (!device) return res.status(404).json({ error: 'Device not found' });
    if (device.mode === 'DIRECT_LINK' && device.directLinkUrl) {
      return res.json({ type: 'direct', url: device.directLinkUrl });
    }
    if (!device.profile) return res.status(404).json({ error: 'Profile not linked' });
    return res.json({ type: 'profile', username: device.profile.username });
  } catch {
    return res.status(500).json({ error: 'Failed to resolve device' });
  }
});
