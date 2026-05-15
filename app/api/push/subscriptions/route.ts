import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface PushSubPayload {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as PushSubPayload;
  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return Response.json({ message: "Invalid subscription payload" }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint: body.endpoint },
    update: {
      userId: Number(session.user.id),
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      expirationTime: body.expirationTime,
    },
    create: {
      userId: Number(session.user.id),
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      expirationTime: body.expirationTime,
    },
  });

  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { endpoint?: string };
  if (!body.endpoint) {
    return Response.json({ message: "Endpoint is required" }, { status: 400 });
  }

  await prisma.pushSubscription.deleteMany({
    where: {
      endpoint: body.endpoint,
      userId: Number(session.user.id),
    },
  });

  return Response.json({ ok: true });
}

