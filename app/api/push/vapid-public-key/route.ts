export async function GET() {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) {
    return Response.json({ message: "VAPID public key is not configured." }, { status: 503 });
  }

  return Response.json({ key });
}

