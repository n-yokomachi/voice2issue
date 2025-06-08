/**
 * セキュアSessionStorageユーティリティ
 */

// Web Crypto API用のキーキャッシュ
let cachedKey: CryptoKey | null = null;

/**
 * AES-GCM暗号化キーを生成・取得
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  try {
    // localStorage からキーを復元を試行
    const storedKey = localStorage.getItem('voice2issue-storage-key');
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
    localStorage.setItem('voice2issue-storage-key', JSON.stringify(exportedKey));
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
 * APIキー専用のセキュアSessionStorage設定
 */
export async function setApiKeyStorage(keyName: string, keyValue: string): Promise<void> {
  if (!keyValue) return;

  try {
    // 値を暗号化
    const encryptedValue = await encryptValue(keyValue);

    // sessionStorageに保存
    sessionStorage.setItem(`voice2issue-${keyName}`, encryptedValue);
    
    console.log(`Secure API key stored in sessionStorage: ${keyName}`);
  } catch (error) {
    console.error('Failed to set secure API key in sessionStorage:', error);
  }
}

/**
 * APIキー専用のセキュアSessionStorage取得
 */
export async function getApiKeyStorage(keyName: string): Promise<string | null> {
  try {
    const encryptedValue = sessionStorage.getItem(`voice2issue-${keyName}`);
    
    if (!encryptedValue) return null;

    // 復号化
    return await decryptValue(encryptedValue);
  } catch (error) {
    console.error('Failed to get secure API key from sessionStorage:', error);
    return null;
  }
}

/**
 * SessionStorage保存可能性チェック
 */
export function isSessionStorageAvailable(): boolean {
  try {
    const testKey = 'voice2issue-test';
    sessionStorage.setItem(testKey, 'test');
    const isAvailable = sessionStorage.getItem(testKey) === 'test';
    
    // テストデータを削除
    if (isAvailable) {
      sessionStorage.removeItem(testKey);
    }
    
    return isAvailable;
  } catch {
    return false;
  }
}

// 互換性のために古い名前もエクスポート
export const setApiKeyCookie = setApiKeyStorage;
export const getApiKeyCookie = getApiKeyStorage;
export const isCookieStorageAvailable = isSessionStorageAvailable;

 