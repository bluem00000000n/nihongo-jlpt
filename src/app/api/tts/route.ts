import { NextRequest, NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

// In-memory audio buffer cache to instantly serve repeated Japanese phrases (Vocab, Kanji, Grammar)
const audioCache = new Map<string, Buffer>();
const MAX_CACHE_SIZE = 400;

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'female', rate = '0%' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Clean text: strip brackets, furigana syntax, markdown
    const cleanText = text
      .replace(/\[[^\]]*[\uac00-\ud7a3]+[^\]]*\]/g, '') // remove Korean in brackets
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')        // strip furigana [漢字](かんじ) -> 漢字
      .replace(/\([^)]*[\uac00-\ud7a3]+[^)]*\)/g, '')    // strip Korean in parentheses
      .replace(/[*_#`~★【】\[\]]/g, '')
      .trim();

    if (!cleanText) {
      return NextResponse.json({ error: 'No speakable Japanese text' }, { status: 400 });
    }

    // Voice selection: Nanami (Natural Tokyo Female) or Keita (Natural Tokyo Male)
    const voiceName =
      voice === 'male' || voice === 'keita'
        ? 'ja-JP-KeitaNeural'
        : 'ja-JP-NanamiNeural';

    const cacheKey = `${voiceName}:${rate}:${cleanText}`;
    if (audioCache.has(cacheKey)) {
      const cached = audioCache.get(cacheKey)!;
      return new NextResponse(new Uint8Array(cached), {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': cached.length.toString(),
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
      });
    }

    // 1. Try Microsoft Azure Neural Speech via MsEdgeTTS
    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      
      const { audioStream } = tts.toStream(cleanText, {
        rate: rate || '0%',
        pitch: '+0Hz',
      });

      const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        audioStream.on('data', (c: Buffer) => chunks.push(c));
        audioStream.on('end', () => resolve(Buffer.concat(chunks)));
        audioStream.on('error', (err) => reject(err));
      });

      if (audioBuffer && audioBuffer.length > 500) {
        if (audioCache.size >= MAX_CACHE_SIZE) {
          const firstKey = audioCache.keys().next().value;
          if (firstKey) audioCache.delete(firstKey);
        }
        audioCache.set(cacheKey, audioBuffer);

        return new NextResponse(new Uint8Array(audioBuffer), {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length.toString(),
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          },
        });
      }
    } catch (edgeErr) {
      console.warn('MsEdgeTTS failed, falling back to Google Translate TTS:', edgeErr);
    }

    // 2. Reliable Fallback: Google Translate TTS API
    const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&q=${encodeURIComponent(
      cleanText.slice(0, 200)
    )}`;
    const googleRes = await fetch(googleTTSUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (googleRes.ok) {
      const arrayBuffer = await googleRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (audioCache.size < MAX_CACHE_SIZE) {
        audioCache.set(cacheKey, buffer);
      }

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
      });
    }

    return NextResponse.json({ error: 'TTS synthesis failed' }, { status: 500 });
  } catch (error: any) {
    console.error('TTS API error:', error);
    return NextResponse.json({ error: error.message || 'TTS Error' }, { status: 500 });
  }
}
