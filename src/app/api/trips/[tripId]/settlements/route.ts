import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createSettlementSchema } from "@/lib/validations";

async function requireTripAccess(tripId: string, userId: string) {
  return prisma.tripMember.findUnique({
    where: { userId_tripId: { userId, tripId } },
  });
}

export async function POST(
  req: Request,
  { params }: { params: { tripId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const member = await requireTripAccess(params.tripId, session.user.id);
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = createSettlementSchema.parse(body);

    const settlement = await prisma.settlement.create({
      data: {
        amount: data.amount,
        method: data.method,
        note: data.note,
        status: "CONFIRMED",
        settledAt: new Date(),
        tripId: params.tripId,
        payerId: data.payerId,
        receiverId: data.receiverId,
        expenseId: data.expenseId,
      },
      include: {
        payer: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(settlement, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Invalid request" },
      { status: 400 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { tripId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const member = await requireTripAccess(params.tripId, session.user.id);
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const settlements = await prisma.settlement.findMany({
    where: { tripId: params.tripId },
    include: {
      payer: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(settlements);
}
