import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'username and password required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('admin_settings')
      .select('username,password')
      .limit(1)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to read admin settings' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Admin settings not found' }, { status: 404 });
    }

    if (String(data.username) === String(username) && String(data.password) === String(password)) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
