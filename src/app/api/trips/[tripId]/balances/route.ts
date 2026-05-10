import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calculateBalances } from "@/lib/balances";

async function requireTripAccess(tripId: string, userId: string) {
  return prisma.tripMember.findUnique({
    where: { userId_tripId: { userId, tripId } },
  });
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

  const expenses = await prisma.expense.findMany({
    where: { tripId: params.tripId },
    include: {
      paidBy: { select: { id: true, name: true, image: true } },
      splits: { include: { user: { select: { id: true, name: true, image: true } } } },
    },
  });

  const settlements = await prisma.settlement.findMany({
    where: { tripId: params.tripId, status: "CONFIRMED" },
  });

  const members = await prisma.tripMember.findMany({
    where: { tripId: params.tripId },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  const balanceResult = calculateBalances(
    expenses.map((e) => ({
      amount: e.amount,
      paidById: e.paidById,
      splits: e.splits.map((s) => ({ userId: s.userId, amount: s.amount })),
    })),
    settlements.map((s) => ({
      amount: s.amount,
      payerId: s.payerId,
      receiverId: s.receiverId,
      status: s.status,
    }))
  );

  // Enrich transactions with user details
  const userMap = new Map(members.map((m) => [m.user.id, m.user]));
  const enrichedTransactions = balanceResult.simplifiedTransactions.map((t) => ({
    ...t,
    from: userMap.get(t.from),
    to: userMap.get(t.to),
  }));

  return NextResponse.json({
    ...balanceResult,
    simplifiedTransactions: enrichedTransactions,
    members: members.map((m) => m.user),
  });
}
