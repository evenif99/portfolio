import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { configureWebPush, webpush } from "@/lib/webpush";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!configureWebPush()) {
    return Response.json({ message: "VAPID keys are not configured" }, { status: 503 });
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: Number(session.user.id) },
  });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            expirationTime: sub.expirationTime,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({
            title: "OpsConsole 알림 테스트",
            body: "모바일 푸시 알림 연결이 정상입니다.",
            url: "/dashboard",
          })
        );
      } catch {
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      }
    })
  );

  return Response.json({ ok: true, count: subscriptions.length });
}

