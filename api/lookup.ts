import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const HUIT_BASE_URL = 'https://sinhvien.huit.edu.vn';
const HUIT_FORM_URL = `${HUIT_BASE_URL}/tra-cuu-thong-tin.html`;
const HUIT_LOOKUP_URL = `${HUIT_BASE_URL}/tra-cuu-thong-tin.html?Length=14`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    const { studentId, studentName, dob, classId, idCard, captcha, token, ncforminfo, cookies: reqCookies } = req.body;
    
    if (!studentId || !studentName || !dob || !classId || !idCard || !captcha || !token || !ncforminfo) {
      return res.status(400).json({ 
        success: false, 
        error: 'Thiếu thông tin tra cứu (MSSV, Họ tên, Ngày sinh, Lớp, CCCD hoặc Captcha)' 
      });
    }
    
    const cookieArr = Array.isArray(reqCookies) 
      ? reqCookies 
      : (typeof reqCookies === 'string' ? reqCookies.split(';').map((s: string) => s.trim()) : []);
    
    // Tạo form data
    const formData = new Map<string, string>([
      ['MaSinhVien', studentId as string],
      ['HoTen', studentName as string],
      ['NgaySinh', dob as string],
      ['LopHoc', classId as string],
      ['SoCMND', idCard as string],
      ['Captcha', captcha as string],
      ['__RequestVerificationToken', token as string],
      ['__ncforminfo', ncforminfo as string]
    ]);
    
    const formBody = Array.from(formData.entries())
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Origin': HUIT_BASE_URL,
      'Referer': HUIT_FORM_URL,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
    
    if (cookieArr.length > 0) {
      headers['Cookie'] = cookieArr.join('; ');
    }
    
    const response = await fetch(HUIT_LOOKUP_URL, {
      method: 'POST',
      headers,
      body: formBody
    });
    
    const text = await response.text();
    
    // Kiểm tra nếu là JSON (lỗi)
    try {
      const json = JSON.parse(text);
      if (json.Errors || json.Message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Thông tin sinh viên hoặc mã xác nhận không chính xác. Vui lòng kiểm tra lại.' 
        });
      }
    } catch {
      // Không phải JSON, tiếp tục parse HTML
    }
    
    // Parse link từ HTML
    const linkMatch = text.match(/href="([^"]*\/tra-cuu\/ket-qua-hoc-tap[^"]*)"/);
    if (!linkMatch) {
      return res.status(400).json({ 
        success: false, 
        error: 'Không tìm thấy đường dẫn điểm trong phản hồi' 
      });
    }
    
    const href = linkMatch[1].startsWith('http') 
      ? linkMatch[1] 
      : HUIT_BASE_URL + linkMatch[1];
    
    return res.json({
      success: true,
      url: href
    });
  } catch (err: any) {
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'Internal error' 
    });
  }
}
