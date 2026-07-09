import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    const { url, cookies: reqCookies } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'Thiếu URL trang điểm' 
      });
    }
    
    const cookieArr = Array.isArray(reqCookies) 
      ? reqCookies 
      : (typeof reqCookies === 'string' ? reqCookies.split(';').map((s: string) => s.trim()) : []);
      
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
    
    if (cookieArr.length > 0) {
      headers['Cookie'] = cookieArr.join('; ');
    }
    
    // Tải trang HTML
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
        return res.status(500).json({ success: false, error: 'Không tải được trang điểm' });
    }
    
    const html = await response.text();
    
    // TẠM THỜI: Trả về HTML gốc để Frontend xử lý, hoặc bạn có thể bóc tách bằng Regex/Cheerio ở đây
    // Nếu dùng thư viện Cheerio:
    // const $ = cheerio.load(html);
    // ... bóc tách điểm ...
    
    return res.json({
      success: true,
      html: html
    });
    
  } catch (err: any) {
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'Internal error' 
    });
  }
}
