import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRole) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  }

  return createClient(supabaseUrl, supabaseServiceRole);
}

async function uploadImages(supabase: any, body: any) {
  const imageUrls: string[] = [];
  const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB per file (server-side guard)

  if (Array.isArray(body.imagesToUpload) && body.imagesToUpload.length > 0) {
    for (const imageToUpload of body.imagesToUpload) {
      const imageBase64: string = imageToUpload.base64;
      const filename = imageToUpload.filename || `product-${Date.now()}.png`;
      const filePath = `product-images/${Date.now()}-${filename}`.replace(/\s+/g, '-');
      const buffer = Buffer.from(imageBase64, 'base64');
      if (buffer.length > MAX_UPLOAD_BYTES) {
        throw new Error(`File ${filename} is too large (${Math.round(buffer.length / 1024)} KB). Maximum allowed is ${Math.round(MAX_UPLOAD_BYTES / 1024)} KB.`);
      }

      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, buffer, {
        contentType: imageToUpload.contentType || 'image/png',
        upsert: true,
      });

      if (uploadError) {
        throw new Error(uploadError.message || String(uploadError));
      }

      const { data: publicData } = supabase.storage.from('product-images').getPublicUrl(filePath);
      if (publicData?.publicUrl) {
        imageUrls.push(publicData.publicUrl);
      }
    }
  }

  if (body.imageBase64 && !imageUrls.length) {
    const imageBase64: string = body.imageBase64;
    const filename = body.imageFilename || `product-${Date.now()}.png`;
    const filePath = `product-images/${Date.now()}-${filename}`.replace(/\s+/g, '-');
    const buffer = Buffer.from(imageBase64, 'base64');
      if (buffer.length > MAX_UPLOAD_BYTES) {
        throw new Error(`File ${filename} is too large (${Math.round(buffer.length / 1024)} KB). Maximum allowed is ${Math.round(MAX_UPLOAD_BYTES / 1024)} KB.`);
      }

      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, buffer, {
      contentType: body.imageContentType || 'image/png',
      upsert: true,
    });

    if (uploadError) {
      throw new Error(uploadError.message || String(uploadError));
    }

    const { data: publicData } = supabase.storage.from('product-images').getPublicUrl(filePath);
    if (publicData?.publicUrl) {
      imageUrls.push(publicData.publicUrl);
    }
  }

  return imageUrls;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getSupabaseClient();
    const imageUrls = await uploadImages(supabase, body);

    if (imageUrls.length > 0) {
      body.images = imageUrls;
      body.image = imageUrls[0];
    }

    delete body.imagesToUpload;
    delete body.imageBase64;
    delete body.imageFilename;
    delete body.imageContentType;

    let insertBody = body;
    let result = await supabase.from('products').insert([insertBody]);
    if (result.error && result.error.code === '42703') {
      insertBody = { ...body };
      delete insertBody.images;
      result = await supabase.from('products').insert([insertBody]);
    }
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }
    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = getSupabaseClient();
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Product id is required for updates.' }, { status: 400 });
    }

    const imageUrls = await uploadImages(supabase, body);
    if (imageUrls.length > 0) {
      body.images = imageUrls;
      body.image = imageUrls[0];
    }

    delete body.imagesToUpload;
    delete body.imageBase64;
    delete body.imageFilename;
    delete body.imageContentType;

    const productId = body.id;
    const updateBody = { ...body };
    delete updateBody.id;

    console.log('[Products API] PATCH update', { productId, updateBody });

    let result = await supabase.from('products').update(updateBody).eq('id', productId);
    if (result.error && result.error.code === '42703') {
      const patchBody = { ...updateBody };
      delete patchBody.images;
      result = await supabase.from('products').update(patchBody).eq('id', productId);
    }
    if (result.error) {
      console.error('[Products API] PATCH failed', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }
    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (err: any) {
    console.error('[Products API] PATCH exception', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
