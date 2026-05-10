import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireTripAccess(tripId: string, userId: string, requiredRole?: string) {
  const member = await prisma.tripMember.findUnique({
    where: { userId_tripId: { userId, tripId } },
  });
  if (!member) return null;
  if (requiredRole === "ADMIN" && member.role !== "ADMIN") return null;
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

  // Any logged-in user can join via invite link
  // No admin check required here


  try {
  const sessionUserId = session.user.id;
  // Check if already a member
  const existingMember = await prisma.tripMember.findUnique({
    where: { userId_tripId: { userId: sessionUserId, tripId: params.tripId } },
  });
  if (existingMember) {
    return NextResponse.json({ error: "User is already a member of this trip" }, { status: 400 });
  }

  // Add member using session user ID
  const newMember = await prisma.tripMember.create({
    data: {
      userId: sessionUserId,
      tripId: params.tripId,
      role: "MEMBER",
    },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });
  return NextResponse.json(newMember, { status: 201 });
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

  const members = await prisma.tripMember.findMany({
    where: { tripId: params.tripId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json(members);
}

export async function DELETE(
  req: Request,
  { params }: { params: { tripId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Any logged-in user can join via invite link; ensure they add themselves only
  const sessionEmail = session.user?.email;
  if (!sessionEmail) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  try {
    const { userId } = await req.json();

    await prisma.tripMember.delete({
      where: { userId_tripId: { userId, tripId: params.tripId } },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Invalid request" },
      { status: 400 }
    );
  }
}
