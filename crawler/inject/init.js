window.chrome = { runtime: {} };
const originalQuery = window.navigator.permissions.query;
window.navigator.permissions.query = (parameters) => (
    parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
);
Object.defineProperties(navigator, {
    webdriver: { get: () => false },
    plugins: { get: () => [1, 2, 3, 4, 5] },
    userAgent: { get: () => "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.0 Safari/537.36" },
    platform: { get: () => 'win32' },
    language: { get: () => 'zh-CN' },
    languages: { get: () => ["zh-CN", "zh"] },
});