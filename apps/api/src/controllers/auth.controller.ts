import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { config } from '../config';
import { AuthenticatedRequest } from '../middleware/auth';
import { Role } from '../shared';

function setAuthCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, phone, role: role || Role.CUSTOMER },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role as Role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    setAuthCookie(res, token);
    return res.status(201).json({ success: true, message: 'Registration successful', data: { user, token } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        pharmacies: {
          select: { id: true, name: true, verificationStatus: true, city: true }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role as Role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    setAuthCookie(res, token);

    const { passwordHash: _, ...userSafe } = user;
    return res.json({ success: true, message: 'Login successful', data: { user: userSafe, token } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out successfully' });
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, phone: true, role: true, createdAt: true,
        pharmacies: {
          select: {
            id: true, name: true, licenseNumber: true, verificationStatus: true,
            address: true, city: true, state: true, postalCode: true,
            latitude: true, longitude: true, phone: true, openingHours: true, isActive: true
          }
        }
      }
    });

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    return res.json({ success: true, data: user });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
