export interface ErrorResponse{
    statusCode: number
    errorType: string
    message: string | string[]
    timestamp: string
    path: string
    requestId?: string
    devLocation?: string
}