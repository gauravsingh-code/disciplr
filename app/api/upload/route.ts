import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucketName = (formData.get('bucket') as string) || 'avatars';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;

    const supabase = await createClient();

    // 1. Try uploading to specified bucket
    let uploadRes = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type || 'image/png',
        upsert: true,
      });

    // 2. If specified bucket fails (e.g. not found), attempt fallback buckets ('profiles', 'public', 'media')
    if (uploadRes.error) {
      console.warn(`Storage upload to ${bucketName} failed:`, uploadRes.error.message);
      const fallbackBuckets = ['profiles', 'public', 'media', 'proofs'].filter(
        (b) => b !== bucketName
      );

      for (const fb of fallbackBuckets) {
        const retryRes = await supabase.storage
          .from(fb)
          .upload(filePath, buffer, {
            contentType: file.type || 'image/png',
            upsert: true,
          });

        if (!retryRes.error) {
          const { data: publicUrlData } = supabase.storage
            .from(fb)
            .getPublicUrl(filePath);

          return NextResponse.json({ url: publicUrlData.publicUrl });
        }
      }

      // If buckets don't exist yet in Supabase, return a high quality encoded data URL
      const base64Data = buffer.toString('base64');
      const dataUrl = `data:${file.type || 'image/png'};base64,${base64Data}`;
      return NextResponse.json({ url: dataUrl });
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
