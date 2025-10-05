import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { TalismanTemplate } from '@/types/talisman';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'src/lib/talisman_formatted.json');
    const fileContents = readFileSync(filePath, 'utf8');
    const templates: TalismanTemplate[] = JSON.parse(fileContents);
    
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error loading talisman templates:', error);
    return NextResponse.json({ error: 'Failed to load talisman templates' }, { status: 500 });
  }
}
