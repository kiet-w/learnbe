export function extractStackTrace(exception:unknown, maxLines = 5): string{
    if(!(exception instanceof Error) || !exception.stack){
        return 'no trace in validation'
    }
    const lines = exception.stack.split('\n')
    const relevantLines = lines.filter((line) => !line.includes('node_modules'))
    return relevantLines.slice(0,maxLines).join('\n')
}