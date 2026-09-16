/**
 * Unit tests for the API client — base URL, interceptors, and token handling.
 */

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn().mockResolvedValue(null),
    setItemAsync: jest.fn().mockResolvedValue(undefined),
    deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native', () => ({
    Platform: { OS: 'android' },
    NativeModules: { SourceCode: { scriptURL: 'http://10.0.2.2:8081/index.bundle' } },
}));

// ── Tests ────────────────────────────────────────────────────────────────────

describe('API Client', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it('should export api instance and token utilities', () => {
        const apiModule = require('../src/lib/api');
        expect(apiModule.default).toBeDefined();
        expect(apiModule.getToken).toBeDefined();
        expect(apiModule.saveToken).toBeDefined();
        expect(apiModule.clearToken).toBeDefined();
    });

    it('should have a base URL configured', () => {
        const { API_BASE_URL } = require('../src/lib/api');
        expect(typeof API_BASE_URL).toBe('string');
        expect(API_BASE_URL).toContain('/api/v1');
    });

    it('should export TOKEN_KEY constant', () => {
        const { TOKEN_KEY } = require('../src/lib/api');
        expect(TOKEN_KEY).toBe('nocturne_jwt');
    });

    it('should export DEV_BYPASS_AUTH flag', () => {
        const { DEV_BYPASS_AUTH } = require('../src/lib/api');
        expect(typeof DEV_BYPASS_AUTH).toBe('boolean');
    });

    it('getToken should return null when no token is stored', async () => {
        const SecureStore = require('expo-secure-store');
        SecureStore.getItemAsync.mockResolvedValue(null);

        const { getToken } = require('../src/lib/api');
        const token = await getToken();
        expect(token).toBeNull();
    });

    it('saveToken should persist token to secure store', async () => {
        const SecureStore = require('expo-secure-store');
        const { saveToken, TOKEN_KEY } = require('../src/lib/api');

        await saveToken('test-jwt-token');
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith(TOKEN_KEY, 'test-jwt-token');
    });

    it('clearToken should remove token from secure store', async () => {
        const SecureStore = require('expo-secure-store');
        const { clearToken, TOKEN_KEY } = require('../src/lib/api');

        await clearToken();
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(TOKEN_KEY);
    });

    it('api instance should have correct baseURL', () => {
        const { default: api, API_BASE_URL } = require('../src/lib/api');
        expect(api.defaults.baseURL).toBe(API_BASE_URL);
    });

    it('api instance should have JSON content-type header', () => {
        const { default: api } = require('../src/lib/api');
        expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('api instance should have a 15s timeout', () => {
        const { default: api } = require('../src/lib/api');
        expect(api.defaults.timeout).toBe(15000);
    });
});
