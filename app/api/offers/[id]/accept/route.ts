import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { withRateLimit } from '@/lib/server/rate-limit';
import { OfferAcceptParamsSchema } from '@/lib/schemas/api';
import { z } from 'zod';

// POST /api/offers/:id/accept
export const POST = withRateLimit({ key: 'offer-accept', limit: 10, windowSec: 60 })(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      // 1. Validate params
      const { id: offerId } = OfferAcceptParamsSchema.parse(params);

      // 2. Check Idempotency-Key
      const idempotencyKey = req.headers.get('idempotency-key');
      if (!idempotencyKey || !z.string().uuid().safeParse(idempotencyKey).success) {
        return NextResponse.json(
          {
            error: {
              code: 'missing_idempotency_key',
              message: 'Idempotency-Key header (UUID) is required',
            },
          },
          { status: 400 }
        );
      }

      // 3. Check cached idempotency response
      const cachedResponse = await db.idempotency.findUnique({
        where: { key: idempotencyKey },
      });

      if (cachedResponse && cachedResponse.expiresAt > new Date()) {
        // Return cached response
        return NextResponse.json(cachedResponse.response, { status: cachedResponse.status });
      }

      // 4. Get user (mock: header에서)
      const userId = req.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001';

      // 5. Transaction: Check inbox → Check already accepted → Issue voucher
      const result = await db.$transaction(async (tx) => {
        // Check inbox
        const inbox = await tx.offerInbox.findUnique({
          where: {
            userId_offerId: {
              userId,
              offerId,
            },
          },
          include: {
            offer: true,
          },
        });

        if (!inbox) {
          throw { status: 404, code: 'offer_not_in_inbox', message: 'Offer not found in inbox' };
        }

        // Already accepted?
        if (inbox.status === 'accepted') {
          const existingVoucher = await tx.voucher.findFirst({
            where: {
              userId,
              offerId,
              status: 'active',
            },
          });

          throw {
            status: 409,
            code: 'already_accepted',
            message: 'Offer already accepted',
            voucher_id: existingVoucher?.id,
          };
        }

        // Check offer expired
        const now = new Date();
        if (inbox.offer.endAt < now) {
          throw { status: 410, code: 'expired', message: 'Offer has expired' };
        }

        // Issue voucher
        const voucher = await tx.voucher.create({
          data: {
            userId,
            offerId,
            status: 'active',
            expireAt: inbox.offer.endAt,
          },
        });

        // Update inbox status
        await tx.offerInbox.update({
          where: {
            userId_offerId: {
              userId,
              offerId,
            },
          },
          data: {
            status: 'accepted',
          },
        });

        // Get wallet count
        const walletCount = await tx.voucher.count({
          where: {
            userId,
            status: 'active',
          },
        });

        return {
          status: 201,
          body: {
            voucher_id: voucher.id,
            wallet_count: walletCount,
          },
        };
      }).catch((error) => {
        // Transaction error handling
        if (error.status) throw error;
        console.error('[Offer Accept Transaction Error]', error);
        throw { status: 500, code: 'internal_error', message: 'Transaction failed' };
      });

      // 6. Save idempotency response (24h TTL)
      await db.idempotency.create({
        data: {
          key: idempotencyKey,
          status: result.status,
          response: result.body,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      // 7. Return success
      return NextResponse.json(result.body, { status: result.status });
    } catch (error: any) {
      // Known errors
      if (error.status) {
        const { status, code, message, ...rest } = error;
        return NextResponse.json(
          {
            error: {
              code,
              message,
            },
            ...rest,
          },
          { status }
        );
      }

      // Unknown errors
      console.error('[Offer Accept Error]', error);
      return NextResponse.json(
        {
          error: {
            code: 'internal_error',
            message: 'An unexpected error occurred',
          },
        },
        { status: 500 }
      );
    }
  }
);
