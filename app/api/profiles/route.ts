// app/api/profiles/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

type Database = unknown;
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, name, surname, userType, userId } = body;

  const supabase = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profiles.upsert({
    where: { id: userId },
    update: { email, name, surname, user_type: userType },
    create: {
      id: userId,
      email,
      name,
      surname,
      user_type: userType,
    },
  });

  return NextResponse.json(profile);
}

export async function GET() {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
  });

  return NextResponse.json(profile ?? null);
}
