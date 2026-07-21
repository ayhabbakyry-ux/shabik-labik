import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * توليد بصمة فريدة للجهاز (Hardware Fingerprint)
 * تسمح بالتعرف على الجهاز حتى لو تغير المتصفح، وتعتمد على مواصفات العتاد.
 */
export function getDeviceFingerprint() {
  if (typeof window === "undefined") return "server";
  
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    const debugInfo = gl?.getExtension("WEBGL_debug_renderer_info");
    const renderer = debugInfo ? gl?.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "unknown";
    
    // دمج مواصفات العتاد الأساسية (دقة الشاشة + المعالج الرسومي + المنطقة الزمنية)
    const hardwareInfo = [
      window.screen.width,
      window.screen.height,
      window.screen.colorDepth,
      navigator.hardwareConcurrency || 0,
      renderer,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    ].join("-");

    // تحويل البيانات لنص مشفر بسيط (Base64)
    return btoa(hardwareInfo).substring(0, 32);
  } catch (e) {
    return "fallback-device-id";
  }
}

/**
 * تنظيف وتحويل رقم الهاتف للصيغة الدولية للواتساب
 */
export function formatWhatsAppNumber(phone: string) {
  let clean = phone.replace(/\D/g, ''); // حذف أي شيء ليس رقماً
  if (clean.startsWith('09')) {
    clean = '963' + clean.substring(1);
  }
  if (!clean.startsWith('963')) {
    clean = '963' + clean;
  }
  return clean;
}
