import { z } from 'zod';
import OpenAI from 'openai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const bodySchema = z.object({
  transcript: z.string().min(10),
  context: z.object({
    mode: z.literal('teach'),
    audience: z.literal('youth'),
    locale: z.string().default('SG')
  })
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const parsed = bodySchema.parse(req.body);
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `From this senior's teaching transcript, return JSON keys:
title, summary, steps (3-7), materials (<=8), tags (3-6). Use SG terms if present.
Transcript: """${parsed.transcript}"""`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    const text = completion.choices[0].message?.content ?? "{}";

    // Parse JSON - response_format ensures valid JSON
    const json = JSON.parse(text);
    res.status(200).json(json);
  } catch (e:any) {
    res.status(400).json({ error: e.message ?? 'bad_request' });
  }
}
