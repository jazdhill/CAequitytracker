export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || !body.message || !body.message.trim()) {
    return Response.json({ ok: false, error: "Message is required" }, { status: 400 });
  }

  const sheetUrl = process.env.FEEDBACK_SHEET_URL;
  if (!sheetUrl) {
    return Response.json({ ok: false, error: "Feedback endpoint not configured" }, { status: 500 });
  }

  try {
    const resp = await fetch(sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: body.type || "Feedback",
        billNumber: body.billNumber || "",
        message: body.message.trim(),
        page: body.page || "",
      }),
    });
    if (!resp.ok) {
      return Response.json({ ok: false, error: `Sheet responded ${resp.status}` }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 502 });
  }
}
