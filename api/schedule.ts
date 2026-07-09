import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const HUIT_BASE_URL = 'https://sinhvien.huit.edu.vn';
const HUIT_SCHEDULE_ENDPOINT = `${HUIT_BASE_URL}/SinhVienTraCuu/GetDanhSachLichTheoTuan`;
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';

function getQueryValue(value: string | string[] | undefined): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0) return value[0];
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const k = getQueryValue(req.query.k);
    if (!k) {
      return res.status(400).json({ success: false, error: 'Thiếu tham số k' });
    }

    const dateParam = getQueryValue(req.query.date);
    const timestampParam = getQueryValue(req.query.timestamp);
    const timestamp = timestampParam && !Number.isNaN(Number(timestampParam))
      ? Number(timestampParam)
      : Date.now();

    const formattedDate = dateParam && dateParam.trim().length > 0
      ? dateParam.trim()
      : formatTimestampToVietnamDate(timestamp);

    const bodyParams: Record<string, string> = {
      k,
      pNgayHienTai: formattedDate,
      pLoaiLich: '0'
    };

    const bodyString = Object.entries(bodyParams)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    const response = await fetch(HUIT_SCHEDULE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': HUIT_BASE_URL,
        'Referer': `${HUIT_BASE_URL}/tra-cuu/lich-hoc-theo-tuan.html?k=${encodeURIComponent(k)}`,
        'User-Agent': DEFAULT_USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      body: bodyString
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `HUIT trả về lỗi ${response.status}`
      });
    }

    const html = await response.text();

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      success: true,
      html,
      timestamp
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Không thể tải thời gian biểu'
    });
  }
}

function formatTimestampToVietnamDate(value: number) {
  const dateObj = new Date(value);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
}
