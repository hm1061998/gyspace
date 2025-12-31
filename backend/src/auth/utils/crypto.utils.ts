import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

/**
 * Băm mật khẩu sử dụng thuật toán scrypt và salt ngẫu nhiên
 * Định dạng lưu trữ: [hashed_string].[salt]
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * So sánh mật khẩu người dùng nhập vào với mật khẩu đã băm trong database
 */
export async function comparePasswords(
  suppliedPassword: string,
  storedPassword: string,
): Promise<boolean> {
  try {
    const [hashed, salt] = storedPassword.split('.');
    if (!hashed || !salt) return false;

    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    const hashedBuf = Buffer.from(hashed, 'hex');

    // Sử dụng timingSafeEqual để ngăn chặn tấn công timing side-channel
    return timingSafeEqual(hashedBuf, buf);
  } catch (error) {
    return false;
  }
}
