import 'dotenv/config';
import axios from 'axios';

const base = (process.env.RYZNN_API_BASE || 'https://ai.ryznn.xyz').replace(/\/+$/, '');
const url = `${base}/v1/models`;

const headers = { 'Content-Type': 'application/json' };
if (process.env.RYZNN_API_KEY) {
  headers['Authorization'] = `Bearer ${process.env.RYZNN_API_KEY}`;
}

const run = async () => {
  try {
    const res = await axios.get(url, { headers });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error listing models:');
    console.error(err.response?.status, err.response?.data || err.message);
  }
};

run();
