import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

// This tells Next.js this route needs full Node.js (not the lightweight "Edge" runtime),
// because pdf-parse and mammoth need Node's file/buffer tools to work.
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file was uploaded.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();

    let extractedText = '';

    if (fileName.endsWith('.pdf')) {
      // Loaded here (not at the top of the file) to avoid a known pdf-parse quirk
      // where it can misbehave if imported before it's actually needed.
     const pdfParseModule: any = await import('pdf-parse');
const pdfParse = pdfParseModule.default ?? pdfParseModule;
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or a .docx Word document.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: extractedText.trim() });
  } catch (err) {
    console.error('Error parsing document:', err);
    return NextResponse.json(
      { error: 'Something went wrong while reading that file. Please try a different file.' },
      { status: 500 }
    );
  }
}