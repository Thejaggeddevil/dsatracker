import { RequestHandler } from 'express';
import { z } from 'zod';
import { userDb } from '../db/database';

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional()
});

export const handleGetProfile: RequestHandler = async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const email = req.user.email;
    const firebaseName = req.user.name || "User";

    // Auto-create user if not in DB
    let user = userDb.findById(userId);

    if (!user) {
      user = userDb.create({
        id: userId,
        name: firebaseName,
        email,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const handleUpdateProfile: RequestHandler = async (req: any, res) => {
  try {
    const userId = req.user.uid;

    const validation = UpdateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0]?.message
      });
    }

    const user = userDb.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (validation.data.name) {
      user.name = validation.data.name;
      user.updatedAt = new Date();
      userDb.update(user);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
