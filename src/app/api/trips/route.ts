import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createTripSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trips = await prisma.trip.findMany({
    where: {
      members: {
        some: { userId: session.user.id },
      },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      expenses: {
        include: {
          paidBy: { select: { id: true, name: true } },
          splits: { include: { user: { select: { id: true, name: true } } } },
        },
      },
      settlements: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(trips);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // If the app was switched to a new database while the user kept an old JWT,
    // the session user may not exist in this DB yet. Ensure it exists before
    // creating the trip/member records.
    const sessionEmail = session.user.email?.trim();
    if (!sessionEmail) {
      return NextResponse.json(
        { error: "Session is missing an email. Please sign out and sign in again." },
        { status: 400 }
      );
    }

    await prisma.user.upsert({
      where: { id: session.user.id },
      update: {
        email: sessionEmail,
        name: session.user.name || sessionEmail.split("@")[0],
        image: session.user.image || null,
      },
      create: {
        id: session.user.id,
        email: sessionEmail,
        name: session.user.name || sessionEmail.split("@")[0],
        image: session.user.image || null,
      },
    });

    const body = await req.json();
    const data = createTripSchema.parse(body);

    const trip = await prisma.trip.create({
      data: {
        name: data.name,
        description: data.description,
        emoji: data.emoji,
        currency: data.currency,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        members: {
          create: {
            userId: session.user.id,
            role: "ADMIN",
          },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Invalid request" },
      { status: 400 }
    );
  }
}
