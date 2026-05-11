import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireTripAccess(tripId: string, userId: string) {
  const member = await prisma.tripMember.findUnique({
    where: { userId_tripId: { userId, tripId } },
  });
  return member;
}

export async function DELETE(
  req: Request,
  { params }: { params: { tripId: string; expenseId: string } }
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
    const expense = await prisma.expense.findUnique({
      where: { id: params.expenseId },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    if (expense.tripId !== params.tripId) {
      return NextResponse.json({ error: "Invalid trip" }, { status: 400 });
    }

    // Only the person who created the expense or an admin can delete it?
    // For now, any trip member can delete? Or maybe just creator and admin.
    // Let's check the creator.
    const isAdmin = member.role === "ADMIN";
    const isCreator = expense.paidById === session.user.id;

    if (!isAdmin && !isCreator) {
      return NextResponse.json({ error: "You don't have permission to delete this expense" }, { status: 403 });
    }

    await prisma.expense.delete({
      where: { id: params.expenseId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete expense" },
      { status: 500 }
    );
  }
}
