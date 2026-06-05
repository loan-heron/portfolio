const limiterBuckets = new Map();

function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
        return forwarded.split(',')[0].trim();
    }

    return req.ip || req.socket?.remoteAddress || 'unknown';
}

function cleanupExpiredBuckets(now) {
    for (const [key, bucket] of limiterBuckets.entries()) {
        if (bucket.resetAt <= now) {
            limiterBuckets.delete(key);
        }
    }
}

export function createRateLimiter(options = {}) {
    const windowMs = Number(options.windowMs || 60_000);
    const limit = Number(options.limit || 60);
    const keyPrefix = options.keyPrefix || 'global';

    return (req, res, next) => {
        const now = Date.now();
        const ip = getClientIp(req);
        const bucketKey = `${keyPrefix}:${ip}`;

        let bucket = limiterBuckets.get(bucketKey);
        if (!bucket || bucket.resetAt <= now) {
            bucket = { count: 0, resetAt: now + windowMs };
        }

        bucket.count += 1;
        limiterBuckets.set(bucketKey, bucket);

        if (Math.random() < 0.015) {
            cleanupExpiredBuckets(now);
        }

        const remaining = Math.max(0, limit - bucket.count);
        const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

        res.setHeader('X-RateLimit-Limit', String(limit));
        res.setHeader('X-RateLimit-Remaining', String(remaining));
        res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

        if (bucket.count > limit) {
            res.setHeader('Retry-After', String(retryAfterSeconds));
            return res.status(429).json({
                success: false,
                message: 'Trop de requêtes. Merci de ralentir.'
            });
        }

        return next();
    };
}

export function antiAbuseMiddleware(req, res, next) {
    const ua = req.get('user-agent') || '';
    const honeypot = typeof req.body?.website === 'string' ? req.body.website.trim() : '';
    const payloadText = JSON.stringify(req.body || {});

    if (honeypot) {
        return res.status(400).json({ success: false, message: 'Requête invalide.' });
    }

    if (!ua || ua.length < 6) {
        return res.status(400).json({ success: false, message: 'Client non autorisé.' });
    }

    if (/viagra|casino|porn|bitcoin\s*wallet|cheap\s*seo/i.test(payloadText)) {
        return res.status(400).json({ success: false, message: 'Contenu suspect détecté.' });
    }

    return next();
}
