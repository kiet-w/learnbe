"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractStackTrace = extractStackTrace;
function extractStackTrace(exception, maxLines = 5) {
    if (!(exception instanceof Error) || !exception.stack) {
        return 'no trace in validation';
    }
    const lines = exception.stack.split('\n');
    const relevantLines = lines.filter((line) => !line.includes('node_modules'));
    return relevantLines.slice(0, maxLines).join('\n');
}
//# sourceMappingURL=extract-stack-trace.helper.js.map