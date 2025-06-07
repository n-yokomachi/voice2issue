/**
 * セキュアCookieストレージ
 */

export interface CookieOptions {
  maxAge?: number; // 秒単位
  expires?: Date;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  domain?: string;
  path?: string;
}

const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  maxAge: 60 * 60 * 2, // 2時間
  secure: true, // HTTPS必須
  sameSite: 'strict', // CSRF攻撃防止
  path: '/', // アプリ全体で有効
};

// Web Crypto API用のキーキャッシュ
let cachedKey: CryptoKey | null = null;

/**
 * AES-GCM暗号化キーを生成・取得
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  try {
    // localStorage からキーを復元を試行
    const storedKey = localStorage.getItem('voice2issue-cookie-key');
    if (storedKey) {
      const keyData = JSON.parse(storedKey);
      cachedKey = await crypto.subtle.importKey(
        'jwk',
        keyData,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      return cachedKey;
    }
  } catch {
    console.warn('Failed to import stored key, generating new one');
  }

  // 新しいキーを生成
  cachedKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // キーを保存
  try {
    const exportedKey = await crypto.subtle.exportKey('jwk', cachedKey);
    localStorage.setItem('voice2issue-cookie-key', JSON.stringify(exportedKey));
  } catch {
    console.warn('Failed to store encryption key');
  }

  return cachedKey;
}

/**
 * AES-GCM暗号化
 */
async function encryptValue(text: string): Promise<string> {
  if (!text) return '';

  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    // IV + 暗号化データを結合してBase64エンコード
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    // フォールバック: Base64エンコードのみ
    return btoa(text);
  }
}

/**
 * AES-GCM復号化
 */
async function decryptValue(encryptedText: string): Promise<string> {
  if (!encryptedText) return '';

  try {
    const key = await getEncryptionKey();
    const combined = new Uint8Array(
      atob(encryptedText).split('').map(char => char.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    // フォールバック: Base64デコード
    try {
      return atob(encryptedText);
    } catch {
      return encryptedText;
    }
  }
}



/**
 * 暗号化してCookieに保存
 */
export async function setSecureCookie(
  name: string, 
  value: string, 
  options: CookieOptions = {}
): Promise<void> {
  if (!value) return;

  try {
    // 値を暗号化
    const encryptedValue = await encryptValue(value);

    // Cookieオプションを構築
    const cookieOptions = { ...DEFAULT_COOKIE_OPTIONS, ...options };
    const optionsString = buildCookieOptionsString(cookieOptions);

    // セキュアCookieを設定
    document.cookie = `${name}=${encodeURIComponent(encryptedValue)}${optionsString}`;
    
    console.log(`Secure cookie set: ${name} (expires in ${cookieOptions.maxAge}s)`);
  } catch (error) {
    console.error('Failed to set secure cookie:', error);
  }
}

/**
 * Cookieから復号化して取得
 */
export async function getSecureCookie(name: string): Promise<string | null> {
  try {
    const cookies = document.cookie.split(';');
    const targetCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${name}=`)
    );

    if (!targetCookie) return null;

    const encryptedValue = decodeURIComponent(
      targetCookie.split('=')[1].trim()
    );

    // 復号化
    return await decryptValue(encryptedValue);
  } catch (error) {
    console.error('Failed to get secure cookie:', error);
    return null;
  }
}

/**
 * セキュアCookieを削除
 */
export function removeSecureCookie(name: string, options: CookieOptions = {}): void {
  try {
    const cookieOptions = { ...DEFAULT_COOKIE_OPTIONS, ...options };
    // 過去の日付を設定して削除
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT${buildCookieOptionsString(cookieOptions)}`;
    console.log(`Secure cookie removed: ${name}`);
  } catch (error) {
    console.error('Failed to remove secure cookie:', error);
  }
}

/**
 * Cookieオプション文字列を構築
 */
function buildCookieOptionsString(options: CookieOptions): string {
  const parts: string[] = [];

  if (options.maxAge !== undefined) {
    parts.push(`; max-age=${options.maxAge}`);
  }

  if (options.expires) {
    parts.push(`; expires=${options.expires.toUTCString()}`);
  }

  if (options.secure) {
    parts.push('; secure');
  }

  if (options.sameSite) {
    parts.push(`; samesite=${options.sameSite}`);
  }

  if (options.domain) {
    parts.push(`; domain=${options.domain}`);
  }

  if (options.path) {
    parts.push(`; path=${options.path}`);
  }

  return parts.join('');
}

/**
 * APIキー専用のセキュアCookie設定
 */
export async function setApiKeyCookie(keyName: string, keyValue: string): Promise<void> {
  await setSecureCookie(`voice2issue-${keyName}`, keyValue, {
    maxAge: 60 * 60 * 2, // 2時間
    secure: true,
    sameSite: 'strict',
    path: '/',
  });
}

/**
 * APIキー専用のセキュアCookie取得
 */
export async function getApiKeyCookie(keyName: string): Promise<string | null> {
  return await getSecureCookie(`voice2issue-${keyName}`);
}

/**
 * 全てのAPIキーCookieを削除
 */
export function clearApiKeyCookies(): void {
  const apiKeyNames = ['github-token', 'anthropic-key'];
  apiKeyNames.forEach(keyName => {
    removeSecureCookie(`voice2issue-${keyName}`);
  });
}

/**
 * Cookie保存可能性チェック
 */
export function isCookieStorageAvailable(): boolean {
  try {
    const testCookie = 'voice2issue-test';
    document.cookie = `${testCookie}=test; max-age=1`;
    const isAvailable = document.cookie.includes(testCookie);
    
    // テストCookieを削除
    if (isAvailable) {
      document.cookie = `${testCookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
    
    return isAvailable;
  } catch {
    return false;
  }
}

 