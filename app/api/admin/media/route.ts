import { NextResponse } from "next/server";
import { BASE, UNREACHABLE } from "@/lib/admin/api";
import { getAdminToken } from "@/lib/admin/session";

/**
 * Photo / video upload for the admin product and add-on forms.
 *
 * A Route Handler rather than a Server Action: Server Action bodies are capped
 * at 1 MB, far too small for a video clip. The file is streamed on to Laravel
 * with the admin token from the httpOnly cookie, which the browser can't read.
 */

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const token = await getAdminToken();
  if (!token) return NextResponse.json({ message: "Your admin session expired — sign in again." }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ message: "Invalid upload." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ message: "No file selected." }, { status: 422 });

  const body = new FormData();
  body.append("file", file, file.name);

  try {
    const res = await fetch(`${BASE}/api/admin/media`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      body,
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({
      // Web servers reject oversized bodies with an HTML page, not JSON.
      message: res.status === 413 ? "File is too large for the server." : `Upload failed (${res.status}).`,
    }));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ message: UNREACHABLE }, { status: 503 });
  }
}
