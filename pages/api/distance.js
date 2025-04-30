import { google } from 'googleapis';

export default async function handler(req, res) {
  const { origin, destination } = req.query;
  const maps = google.maps({
    version: 'v1',
    auth: process.env.GOOGLE_MAPS_API_KEY,
  });
  const response = await maps.distances({
    origins: [origin],
    destinations: [destination],
  });
  res.json(response.data);
}