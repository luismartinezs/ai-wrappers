export function logger(context: string, message: string, data?: any) {
  if (process.env.NODE_ENV === "development") {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      context,
      message,
      ...(data && { data })
    }

    console.log(JSON.stringify(logEntry, null, 2))
  }
}