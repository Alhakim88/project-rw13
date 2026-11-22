// middleware/errorHandler.js
// Global error handler Express

/**
 * Tangani semua error yang diteruskan via next(err)
 */
function errorHandler(err, req, res, _next) {
  console.error("💥 Server Error:", err.stack || err.message);

  const status = err.status || err.statusCode || 500;
  const pesan  = err.message || "Terjadi kesalahan pada server.";

  res.status(status).json({
    success: false,
    pesan,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

/**
 * Tangani route yang tidak ditemukan (404)
 */
function notFound(req, res) {
  res.status(404).json({
    success: false,
    pesan: `Route tidak ditemukan: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFound };
