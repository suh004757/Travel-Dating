window.DateScapeUtils = (function createDateScapeUtils() {
    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function sanitizeExternalUrl(value) {
        if (!value) return '';

        try {
            const url = new URL(String(value), window.location.origin);
            const allowedProtocols = new Set(['http:', 'https:']);
            if (!allowedProtocols.has(url.protocol)) {
                return '';
            }
            return url.href;
        } catch {
            return '';
        }
    }

    function formatDate(value, locale = 'ko-KR', options) {
        if (!value) return '';
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleDateString(locale, options);
    }

    return {
        escapeHtml,
        sanitizeExternalUrl,
        formatDate
    };
}());
