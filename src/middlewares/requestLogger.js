function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();
  const requestTime = new Date().toISOString();

  const requestInfo = {
    time: requestTime,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    params: req.params,
    query: req.query,
    body: req.body,
    headers: req.headers,
  };

  console.log('[REQUEST]', requestInfo);

  res.on('finish', () => {
    const finishedAt = process.hrtime.bigint();
    const responseTimeMs = Number(finishedAt - startedAt) / 1_000_000;

    console.log('[RESPONSE]', {
      time: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: Number(responseTimeMs.toFixed(2)),
    });
  });

  next();
}

module.exports = requestLogger;
