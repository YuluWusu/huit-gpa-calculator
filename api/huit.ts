import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch, { RequestInit, Response } from 'node-fetch';

const HUIT_BASE_URL = 'https://sinhvien.huit.edu.vn';
const HUIT_FORM_URL = `${HUIT_BASE_URL}/tra-cuu-thong-tin.html`;
const HUIT_LOOKUP_URL = `${HUIT_BASE_URL}/tra-cuu-thong-tin.html?Length=14`;
const HUIT_CAPTCHA_URL = `${HUIT_BASE_URL}/WebCommon/GetCaptcha`;

// Helper: fetch with cookie jar (simple, not persistent)
async function fetchWithCookies(url: string, options: RequestInit = {}, cookies: string[] = []): Promise<{ res: Response, setCookies: string[] }> {
  const headers: Record<string, string> = options.headers ? { ...(options.headers as Record<string, string>) } : {};
  if (cookies.length > 0) {
    headers['Cookie'] = cookies.join('; ');
  }
  const res = await fetch(url, { ...options, headers });
  const rawHeaders = res.headers.raw();
  const setCookies = (rawHeaders['set-cookie'] || []) as string[];
  return { res, setCookies };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;
  let cookies: string[] = [];

  try {
    if (action === 'init') {
      // Lấy token và ncforminfo
      const { res: formRes, setCookies } = await fetchWithCookies(HUIT_FORM_URL, { method: 'GET' });
      cookies = setCookies;
      const html = await formRes.text();
      const tokenMatch = html.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/);
      const ncformMatch = html.match(/name="__ncforminfo"[^>]*value="([^"]+)"/);
      if (!tokenMatch || !ncformMatch) {
        return res.status(500).json({ success: false, error: 'Không lấy được token/ncforminfo' });
      }
      return res.json({
        success: true,
        token: tokenMatch[1],
        ncforminfo: ncformMatch[1],
        cookies
      });
    }

    if (action === 'captcha') {
      // Lấy captcha (cần truyền cookie từ init)
      const cookieHeader = req.headers['cookie'] || req.query.cookies || '';
      const cookieArr = typeof cookieHeader === 'string' ? cookieHeader.split(';').map(s => s.trim()) : [];
      const { res: captchaRes } = await fetchWithCookies(HUIT_CAPTCHA_URL + `?t=${Date.now()}`, { method: 'GET' }, cookieArr);
      if (!captchaRes.ok) {
        return res.status(500).json({ success: false, error: 'Không tải được captcha' });
      }
      const buf = await captchaRes.buffer();
      const base64 = buf.toString('base64');
      return res.json({
        success: true,
        image: `data:image/png;base64,${base64}`
      });
    }

    if (action === 'lookup') {
      // Tra cứu điểm
      const { studentId, captcha, token, ncforminfo, cookies: reqCookies } = req.method === 'POST' ? req.body : req.query;
      if (!studentId || !captcha || !token || !ncforminfo) {
        return res.status(400).json({ success: false, error: 'Thiếu thông tin tra cứu' });
      }
      const cookieArr = Array.isArray(reqCookies) ? reqCookies : (typeof reqCookies === 'string' ? reqCookies.split(';').map(s => s.trim()) : []);
      // Gửi POST
      const formData = new Map<string, string>([
        ['MaSinhVien', studentId as string],
        ['HoTen', ''],
        ['NgaySinh', ''],
        ['LopHoc', ''],
        ['SoCMND', ''],
        ['Captcha', captcha as string],
        ['__RequestVerificationToken', token as string],
        ['__ncforminfo', ncforminfo as string]
      ]);
      const formBody = Array.from(formData.entries())
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
        
      const { res: lookupRes } = await fetchWithCookies(HUIT_LOOKUP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Origin': HUIT_BASE_URL,
          'Referer': HUIT_FORM_URL
        },
        body: formBody
      }, cookieArr);
      const text = await lookupRes.text();
      // Nếu là JSON (lỗi)
      try {
        const json = JSON.parse(text);
        if (json.Errors) {
          return res.status(400).json({ success: false, error: json.Errors.Captcha?.errors?.[0] || json.Errors.MaSinhVien?.errors?.[0] || json.Message || 'Lỗi tra cứu' });
        }
        if (json.Message) {
          return res.status(400).json({ success: false, error: json.Message });
        }
      } catch {}
      // Parse link
      const linkMatch = text.match(/href="([^"]*\/tra-cuu\/ket-qua-hoc-tap[^"]*)"/);
      if (!linkMatch) {
        return res.status(400).json({ success: false, error: 'Không tìm thấy đường dẫn điểm trong phản hồi' });
      }
      const href = linkMatch[1].startsWith('http') ? linkMatch[1] : HUIT_BASE_URL + linkMatch[1];
      return res.json({
        success: true,
        url: href
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid action' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Internal error' });
  }
}
