import { NextRequest, NextResponse } from 'next/server';
import { GenerateTopicImageRequestSchema } from '@/schema/docx-ingestion.schema';
import { generateTopicImage } from '@/services/ai/image-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedReq = GenerateTopicImageRequestSchema.parse(body);
    const generated = await generateTopicImage(parsedReq);
    return NextResponse.json(generated);
  } catch (error) {
    console.error('AI image generation error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate image',
      },
      { status: 400 }
    );
  }
}
