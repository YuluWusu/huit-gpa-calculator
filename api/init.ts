import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const HUIT_BASE_URL = 'https://sinhvien.huit.edu.vn';
const HUIT_FORM_URL = `${HUIT_BASE_URL}/tra-cuu-thong-tin.html`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const response = await fetch(HUIT_FORM_URL, { method: 'GET' });
    const setCookies = response.headers.raw()['set-cookie'] || [];
    const html = await response.text();
    
    const tokenMatch = html.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/);
    const ncformMatch = html.match(/name="__ncforminfo"[^>]*value="([^"]+)"/);
    
    if (!tokenMatch || !ncformMatch) {
      return res.status(500).json({ 
        success: false, 
        error: 'Không lấy được token/ncforminfo' 
      });
    }
    
    return res.json({
      success: true,
      token: tokenMatch[1],
      ncforminfo: ncformMatch[1],
      cookies: setCookies
    });
  } catch (err: any) {
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'Internal error' 
    });
  }
}
