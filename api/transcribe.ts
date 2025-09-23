import type { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // For Day 1: prove env + routing
  res.status(200).json({ transcript: "Day 1 placeholder transcript." });
}
