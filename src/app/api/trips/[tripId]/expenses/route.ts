import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createExpenseSchema } from "@/lib/validations";

async function requireTripAccess(tripId: string, userId: string) {
  const member = await prisma.tripMember.findUnique({
    where: { userId_tripId: { userId, tripId } },
  });
  return member;
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
    const data = createExpenseSchema.parse(body);

    // Validate split amounts sum to total
    if (data.splitType === "UNEQUAL") {
      const totalSplit = data.splitAmong.reduce((sum, s) => sum + (s.amount || 0), 0);
      if (Math.abs(totalSplit - data.amount) > 0.01) {
        return NextResponse.json(
          { error: "Split amounts must equal total amount" },
          { status: 400 }
        );
      }
    }

    if (data.splitType === "PERCENTAGE") {
      const totalPct = data.splitAmong.reduce((sum, s) => sum + (s.percentage || 0), 0);
      if (Math.abs(totalPct - 100) > 0.01) {
        return NextResponse.json(
          { error: "Percentages must sum to 100%" },
          { status: 400 }
        );
      }
    }

    // Calculate split amounts
    let splits: { userId: string; amount: number; percentage?: number }[] = [];

    if (data.splitType === "EQUAL") {
      const splitAmount = data.amount / data.splitAmong.length;
      splits = data.splitAmong.map((s) => ({
        userId: s.userId,
        amount: Math.round(splitAmount * 100) / 100,
      }));
    } else if (data.splitType === "UNEQUAL") {
      splits = data.splitAmong.map((s) => ({
        userId: s.userId,
        amount: s.amount || 0,
      }));
    } else if (data.splitType === "PERCENTAGE") {
      splits = data.splitAmong.map((s) => ({
        userId: s.userId,
        amount: Math.round((data.amount * (s.percentage || 0)) / 100 * 100) / 100,
        percentage: s.percentage,
      }));
    }

    // Fix rounding: adjust last split so total matches exactly
    const currentTotal = splits.reduce((sum, s) => sum + s.amount, 0);
    if (Math.abs(currentTotal - data.amount) > 0.001 && splits.length > 0) {
      const diff = data.amount - currentTotal;
      splits[splits.length - 1].amount = Math.round((splits[splits.length - 1].amount + diff) * 100) / 100;
    }

    const expense = await prisma.expense.create({
      data: {
        title: data.title,
        amount: data.amount,
        category: data.category,
        notes: data.notes,
        receiptUrl: data.receiptUrl,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        splitType: data.splitType,
        date: data.date ? new Date(data.date) : new Date(),
        tripId: params.tripId,
        paidById: data.paidById,
        splits: {
          create: splits.map((s) => ({
            userId: s.userId,
            amount: s.amount,
            percentage: s.percentage,
          })),
        },
      },
      include: {
        paidBy: { select: { id: true, name: true, image: true } },
        splits: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    return NextResponse.json(expense, { status: 201 });
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

  const expenses = await prisma.expense.findMany({
    where: { tripId: params.tripId },
    include: {
      paidBy: { select: { id: true, name: true, image: true } },
      splits: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(expenses);
}
