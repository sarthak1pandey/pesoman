import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const trip = await prisma.trip.findUnique({
    where: { inviteToken: token },
    select: { id: true, name: true },
  });

  if (!trip) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  }

  return NextResponse.json(trip);
}
