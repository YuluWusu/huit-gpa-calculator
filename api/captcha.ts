import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const HUIT_BASE_URL = 'https://sinhvien.huit.edu.vn';
const HUIT_CAPTCHA_URL = `${HUIT_BASE_URL}/WebCommon/GetCaptcha`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Nhận cookies từ body (POST) hoặc query (GET)
    let cookieArr: string[] = [];
    
    if (req.method === 'POST' && req.body?.cookies) {
      cookieArr = Array.isArray(req.body.cookies) 
        ? req.body.cookies 
        : req.body.cookies.split(';').map((s: string) => s.trim()).filter(Boolean);
    } else if (req.query.cookies) {
      const cookiesStr = req.query.cookies as string;
      cookieArr = cookiesStr.split(';').map(s => s.trim()).filter(Boolean);
    }
    
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://sinhvien.huit.edu.vn/tra-cuu-thong-tin.html'
    };
    
    if (cookieArr.length > 0) {
      headers['Cookie'] = cookieArr.join('; ');
    }
    
    const response = await fetch(`${HUIT_CAPTCHA_URL}?t=${Date.now()}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      return res.status(500).json({ 
        success: false, 
        error: 'Không tải được captcha' 
      });
    }
    
    const buffer = await response.buffer();
    const base64 = buffer.toString('base64');
    
    return res.json({
      success: true,
      image: `data:image/png;base64,${base64}`
    });
  } catch (err: any) {
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'Internal error' 
    });
  }
}
