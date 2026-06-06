import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseServiceRole = getEnv('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function uploadImages(body: any) {
  const imageUrls: string[] = [];

  if (Array.isArray(body.imagesToUpload) && body.imagesToUpload.length > 0) {
    for (const imageToUpload of body.imagesToUpload) {
      const imageBase64: string = imageToUpload.base64;
      const filename = imageToUpload.filename || `product-${Date.now()}.png`;
      const filePath = `product-images/${Date.now()}-${filename}`.replace(/\s+/g, '-');
      const buffer = Buffer.from(imageBase64, 'base64');

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
    const imageUrls = await uploadImages(body);

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
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Product id is required for updates.' }, { status: 400 });
    }

    const imageUrls = await uploadImages(body);
    if (imageUrls.length > 0) {
      body.images = imageUrls;
      body.image = imageUrls[0];
    }

    delete body.imagesToUpload;
    delete body.imageBase64;
    delete body.imageFilename;
    delete body.imageContentType;

    let updateBody = body;
    let result = await supabase.from('products').update(updateBody).eq('id', body.id);
    if (result.error && result.error.code === '42703') {
      updateBody = { ...body };
      delete updateBody.images;
      result = await supabase.from('products').update(updateBody).eq('id', body.id);
    }
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }
    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
