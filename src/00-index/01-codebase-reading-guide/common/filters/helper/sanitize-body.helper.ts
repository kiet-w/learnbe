const SENSITIVE_FIELDS = [
  'password', 'accessToken', 'refreshToken', 
  'token', 'secret', 'authorization', 
  'creditCard', 'cvv', 'ssn',
];

const MAX_BODY_LOG_SIZE = 4096; // 4KB tối đa cho log body

/**
 * Sanitize body: che giấu thông tin nhạy cảm ở mọi cấp độ (nested object, array)
 * và giới hạn kích thước log để tránh nặng hệ thống.
 */
export const sanitizeBody = (body: any): any => {
  if (!body) return body;

  const sanitized = sanitizeDeep(body);

  // Giới hạn kích thước log
  const serialized = JSON.stringify(sanitized);
  if (serialized.length > MAX_BODY_LOG_SIZE) {
    return { 
      _truncated: true, 
      _originalSize: `${serialized.length} bytes`,
      _preview: serialized.slice(0, MAX_BODY_LOG_SIZE) + '...',
    };
  }

  return sanitized;
};

/**
 * Đệ quy sanitize qua tất cả các cấp: object lồng object, array chứa object...
 */
function sanitizeDeep(value: any, depth = 0): any {
  // Chống đệ quy vô hạn (tối đa 10 cấp)
  if (depth > 10) return '[nested too deep]';

  // Trường hợp null/undefined/primitive
  if (value === null || value === undefined || typeof value !== 'object') {
    return value;
  }

  // Trường hợp Array: sanitize từng phần tử
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDeep(item, depth + 1));
  }

  // Trường hợp Object: sanitize từng key
  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(value)) {
    if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
      sanitized[key] = '***';
    } else {
      sanitized[key] = sanitizeDeep(value[key], depth + 1);
    }
  }
  return sanitized;
}
