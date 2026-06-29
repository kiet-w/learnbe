export const sanitizeBody = (body: any) => {
  if (!body) return body;
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'accessToken', 'refreshToken', 'token', 'secret'];
  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = '***';
    }
  });
  return sanitized;
};
