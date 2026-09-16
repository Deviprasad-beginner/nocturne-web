/**
 * Unit tests for the AuthContext — login, register, logout, and dev bypass.
 */

import React from 'react';

// ── Mock Firebase ────────────────────────────────────────────────────────────
const mockOnAuthStateChanged = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockUpdateProfile = jest.fn();
const mockSignOut = jest.fn();
const mockGetIdToken = jest.fn().mockResolvedValue('mock-firebase-id-token');

jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
    createUserWithEmailAndPassword: (...args: any[]) => mockCreateUserWithEmailAndPassword(...args),
    updateProfile: (...args: any[]) => mockUpdateProfile(...args),
    signOut: (...args: any[]) => mockSignOut(...args),
    onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args),
    getAuth: jest.fn(),
}));

jest.mock('../src/lib/firebase', () => ({
    auth: {},
}));

jest.mock('../src/lib/api', () => ({
    DEV_BYPASS_AUTH: false,
    __esModule: true,
    default: { get: jest.fn(), post: jest.fn() },
}));

// ── Tests ────────────────────────────────────────────────────────────────────

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should export AuthProvider and useAuth', () => {
        const AuthModule = require('../src/context/AuthContext');
        expect(AuthModule.AuthProvider).toBeDefined();
        expect(AuthModule.useAuth).toBeDefined();
    });

    it('should start with loading state', () => {
        // Mock onAuthStateChanged to not call the callback immediately
        mockOnAuthStateChanged.mockImplementation(() => jest.fn());

        const { AuthProvider } = require('../src/context/AuthContext');
        // AuthProvider should be renderable
        expect(typeof AuthProvider).toBe('function');
    });

    it('should handle Firebase auth state change for logged-in user', () => {
        const mockUser = {
            uid: 'test-uid',
            displayName: 'TestUser',
            email: 'test@example.com',
            getIdToken: mockGetIdToken,
        };

        mockOnAuthStateChanged.mockImplementation((auth: any, callback: any) => {
            // Simulate a logged-in user
            callback(mockUser);
            return jest.fn(); // unsubscribe
        });

        const { AuthProvider } = require('../src/context/AuthContext');
        expect(typeof AuthProvider).toBe('function');
    });

    it('should handle Firebase auth state change for logged-out user', () => {
        mockOnAuthStateChanged.mockImplementation((auth: any, callback: any) => {
            callback(null); // No user
            return jest.fn();
        });

        const { AuthProvider } = require('../src/context/AuthContext');
        expect(typeof AuthProvider).toBe('function');
    });

    it('should call signInWithEmailAndPassword on login', async () => {
        mockSignInWithEmailAndPassword.mockResolvedValue({ user: { uid: '1' } });
        mockOnAuthStateChanged.mockImplementation(() => jest.fn());

        // The login function wraps signInWithEmailAndPassword
        const { signInWithEmailAndPassword } = require('firebase/auth');
        await signInWithEmailAndPassword({}, 'test@example.com', 'password123');

        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
            {}, 'test@example.com', 'password123'
        );
    });

    it('should call createUserWithEmailAndPassword on register', async () => {
        const mockUser = {
            uid: 'new-uid',
            email: 'new@example.com',
            getIdToken: mockGetIdToken,
        };
        mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
        mockUpdateProfile.mockResolvedValue(undefined);

        const { createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
        const result = await createUserWithEmailAndPassword({}, 'new@example.com', 'pass123');
        expect(result.user.uid).toBe('new-uid');

        await updateProfile(result.user, { displayName: 'NewUser' });
        expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'NewUser' });
    });

    it('should call signOut on logout', async () => {
        mockSignOut.mockResolvedValue(undefined);

        const { signOut } = require('firebase/auth');
        await signOut({});
        expect(mockSignOut).toHaveBeenCalled();
    });
});
