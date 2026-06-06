import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const { path } = await req.json();
    const target = path || '/';
    try {
      revalidatePath(target);
    } catch (err) {
      console.warn('revalidatePath failed', err);
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
