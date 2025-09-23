import { z } from 'zod';
import OpenAI from 'openai';

const bodySchema = z.object({
  transcript: z.string().min(10),
  context: z.object({
    mode: z.literal('teach'),
    audience: z.literal('youth'),
    locale: z.string().default('SG')
  })
});

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    });
    const text = completion.choices[0].message?.content ?? "{}";
    // Best-effort parse
    const jsonStart = text.indexOf('{');
    const json = JSON.parse(text.slice(jsonStart));
    res.status(200).json(json);
  } catch (e:any) {
    res.status(400).json({ error: e.message ?? 'bad_request' });
  }
}
