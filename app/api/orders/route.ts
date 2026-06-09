import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../utils/supabase/service';

const STORAGE_BUCKET = 'order-payment-screenshots';
const ALLOWED_STATUSES = ['Pending', 'Confirmed', 'Rejected', 'Shipped', 'Delivered', 'Cancelled'];

async function ensureBucket(supabase: any) {
  try {
    const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
    });
    if (error && !error.message?.includes('already exists')) {
      throw error;
    }
  } catch (error: any) {
    if (error?.message?.includes('already exists')) {
      return;
    }
    console.warn('[Orders API] Could not ensure bucket:', error.message || error);
  }
}

async function uploadScreenshot(supabase: any, file: File) {
  if (!file || !file.size) {
    return null;
  }

  await ensureBucket(supabase);

  const filename = `${Date.now()}-${file.name}`.replace(/\s+/g, '-');
  const filePath = `order-screenshots/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Failed to upload payment screenshot');
  }

  const { data: publicData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return publicData?.publicUrl ?? null;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const supabase = createServiceClient();

    const productId = Number(formData.get('product_id'));
    const customerName = String(formData.get('customer_name') ?? '').trim();
    const customerContact = String(formData.get('customer_contact') ?? '').trim();
    const quantity = Number(formData.get('quantity')) || 1;
    const shippingRegion = String(formData.get('shipping_region') ?? '').trim();
    const shippingCity = String(formData.get('shipping_city') ?? '').trim();
    const shippingSubCity = String(formData.get('shipping_sub_city') ?? '').trim();
    const shippingAddress = String(formData.get('shipping_address') ?? '').trim();
    const paymentMethod = String(formData.get('payment_method') ?? 'cash');
    const notes = String(formData.get('notes') ?? '').trim();
    const totalPrice = Number(formData.get('total_price')) || 0;

    if (!productId || !customerName || !customerContact || !shippingRegion || !shippingCity || !shippingSubCity || !shippingAddress) {
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
    }

    let paymentScreenshotUrl: string | null = null;
    const screenshotFile = formData.get('screenshot');
    if (paymentMethod === 'mobile_banking' && screenshotFile instanceof File && screenshotFile.size > 0) {
      paymentScreenshotUrl = await uploadScreenshot(supabase, screenshotFile);
    }

    const insertData: any = {
      product_id: productId,
      customer_name: customerName,
      customer_contact: customerContact,
      quantity,
      total_price: totalPrice,
      payment_method: paymentMethod,
      payment_screenshot_url: paymentScreenshotUrl,
      shipping_region: shippingRegion,
      shipping_city: shippingCity,
      shipping_sub_city: shippingSubCity,
      shipping_address: shippingAddress,
      notes,
      status: 'Pending',
    };

    const removeMissingColumns = (errorMessage: string, data: Record<string, any>) => {
      const missingColumns = Array.from(errorMessage.matchAll(/(?:Could not find the|'([^']+)' column|column "([^"]+)" does not exist)/gi))
        .map((match) => match[1] || match[2])
        .filter(Boolean);

      const cleaned = { ...data };
      missingColumns.forEach((column) => {
        if (column in cleaned) {
          delete cleaned[column];
        }
      });
      return cleaned;
    };

    const insertOrder = async (data: any) => {
      return await supabase.from('orders').insert([data]);
    };

    let result = await insertOrder(insertData);

    if (result.error) {
      const cleanedInsert = removeMissingColumns(result.error.message || '', insertData);
      if (Object.keys(cleanedInsert).length < Object.keys(insertData).length) {
        result = await insertOrder(cleanedInsert);
      }
    }

    if (result.error) {
      const fallbackInsert = {
        product_id: productId,
        customer_name: customerName,
        customer_contact: customerContact,
        status: 'Pending',
      };
      result = await insertOrder(fallbackInsert);
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ order: result.data?.[0] ?? null }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: String(error.message || error) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const supabase = createServiceClient();

    const orderId = Number(body.id);
    const status = String(body.status ?? '').trim();

    if (!orderId || !status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid order id or status' }, { status: 400 });
    }

    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order: { id: orderId, status } }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: String(error.message || error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const orderId = Number(body.id);
    if (!orderId) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: String(error.message || error) }, { status: 500 });
  }
}
