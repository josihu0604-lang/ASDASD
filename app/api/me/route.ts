import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRequestId, logRequest } from '@/lib/server/logger';
import { prisma } from '@/lib/prisma';

const UpdateProfileSchema = z.object({
  nickname: z.string().min(2).max(20).optional(),
  instagramUrl: z.string().url().optional().nullable(),
  youtubeUrl: z.string().url().optional().nullable(),
  tiktokUrl: z.string().url().optional().nullable(),
});

async function getUserFromToken(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

export async function GET(request: NextRequest) {
  const requestId = createRequestId();
  const startTime = Date.now();

  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다' },
        { status: 401 }
      );
    }

    logRequest({
      route: '/api/me',
      method: 'GET',
      status: 200,
      took_ms: Date.now() - startTime,
      request_id: requestId,
      user_id: user.id,
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isVerified: user.isVerified,
      snsLinks: {
        instagram: user.instagramUrl,
        youtube: user.youtubeUrl,
        tiktok: user.tiktokUrl,
      },
      createdAt: user.createdAt,
    });

  } catch (error) {
    logRequest({
      route: '/api/me',
      method: 'GET',
      status: 500,
      took_ms: Date.now() - startTime,
      request_id: requestId,
      error_code: 'INTERNAL_ERROR',
    });

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const requestId = createRequestId();
  const startTime = Date.now();

  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updates = UpdateProfileSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(updates.nickname && { nickname: updates.nickname }),
        ...(updates.instagramUrl !== undefined && { instagramUrl: updates.instagramUrl }),
        ...(updates.youtubeUrl !== undefined && { youtubeUrl: updates.youtubeUrl }),
        ...(updates.tiktokUrl !== undefined && { tiktokUrl: updates.tiktokUrl }),
      },
    });

    logRequest({
      route: '/api/me',
      method: 'PATCH',
      status: 200,
      took_ms: Date.now() - startTime,
      request_id: requestId,
      user_id: user.id,
    });

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      phone: updatedUser.phone,
      nickname: updatedUser.nickname,
      avatarUrl: updatedUser.avatarUrl,
      snsLinks: {
        instagram: updatedUser.instagramUrl,
        youtube: updatedUser.youtubeUrl,
        tiktok: updatedUser.tiktokUrl,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 입력입니다', details: error.errors },
        { status: 400 }
      );
    }

    logRequest({
      route: '/api/me',
      method: 'PATCH',
      status: 500,
      took_ms: Date.now() - startTime,
      request_id: requestId,
      error_code: 'INTERNAL_ERROR',
    });

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
