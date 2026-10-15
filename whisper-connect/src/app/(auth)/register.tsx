import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { register, loginWithGoogle } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useGoogleAuth } from '@/lib/googleAuth';
import { haptics } from '@/lib/haptics';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleRegister = async () => {
    if (!username || !password) {
      haptics.error();
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      haptics.error();
      setError('Password must be at least 6 characters');
      return;
    }
    haptics.medium();
    setError(null);
    setIsLoading(true);
    try {
      const response = await register(username, password);
      if (response.success && response.data) {
        haptics.success();
        await signIn(response.data.token, response.data.user);
        router.replace('/' as any);
      } else {
        haptics.error();
        setError('Invalid registration response.');
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        setError('Server is taking too long to respond. Check your connection.');
      } else {
        haptics.error();
        setError(e.message || 'Could not create account.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const response = await loginWithGoogle(idToken);
      if (response.success && response.data) {
        haptics.success();
        await signIn(response.data.token, response.data.user);
        router.replace('/' as any);
      } else {
        haptics.error();
        setError('Google sign-in failed. Please try again.');
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        setError('Server is taking too long to respond. Check your connection.');
      } else {
        haptics.error();
        setError(e.message || 'Google sign-in failed.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const { request, promptAsync } = useGoogleAuth(
    handleGoogleSuccess,
    (msg) => { setError(msg); setIsGoogleLoading(false); }
  );

  const anyLoading = isLoading || isGoogleLoading;

  return (
    <View className="flex-1 bg-background px-6 justify-center">
      <View className="mb-10">
        <Text className="text-purpleLight text-xs tracking-widest font-sans mb-2">NEW BEGINNING</Text>
        <Text className="text-white text-4xl tracking-tighter mb-2">Join Nocturne</Text>
        <Text className="text-muted text-sm">Create your alias for the night.</Text>
      </View>

      {/* Google Sign-In */}
      <TouchableOpacity
        onPress={() => { haptics.medium(); setError(null); setIsGoogleLoading(true); promptAsync(); }}
        disabled={anyLoading || !request}
        className={'flex-row items-center justify-center border border-border rounded-xl py-4 mb-6 gap-3 ' + (anyLoading ? 'opacity-50' : 'opacity-100')}
        style={{ backgroundColor: '#1E1C2E' }}
      >
        {isGoogleLoading ? (
          <ActivityIndicator color="#b9a7ff" />
        ) : (
          <>
            <Text style={{ fontSize: 18 }}>G</Text>
            <Text className="text-white font-bold">Continue with Google</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <View className="flex-row items-center mb-6 gap-3">
        <View className="flex-1 h-px bg-border" />
        <Text className="text-muted text-xs">OR</Text>
        <View className="flex-1 h-px bg-border" />
      </View>

      <View className="space-y-4 gap-4 mb-4">
        <View>
          <Text className="text-muted text-xs mb-2 ml-1">USERNAME (ALIAS)</Text>
          <TextInput
            className="bg-surface border border-border rounded-xl p-4 text-white text-base"
            placeholder="Choose an alias"
            placeholderTextColor="#636174"
            value={username}
            onChangeText={(t) => { setUsername(t); setError(null); }}
            autoCapitalize="none"
            editable={!anyLoading}
          />
        </View>

        <View>
          <Text className="text-muted text-xs mb-2 ml-1">PASSWORD</Text>
          <TextInput
            className="bg-surface border border-border rounded-xl p-4 text-white text-base"
            placeholder="At least 6 characters"
            placeholderTextColor="#636174"
            value={password}
            onChangeText={(t) => { setPassword(t); setError(null); }}
            secureTextEntry
            editable={!anyLoading}
          />
        </View>
      </View>

      {error ? (
        <Text style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</Text>
      ) : null}

      <TouchableOpacity
        onPress={handleRegister}
        disabled={anyLoading}
        className={'bg-purple rounded-xl py-4 items-center mb-6 ' + (anyLoading ? 'opacity-50' : 'opacity-100')}
      >
        {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Create Account →</Text>}
      </TouchableOpacity>

      <View className="flex-row justify-center">
        <Text className="text-muted">Already have an account? </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-purpleLight font-bold">Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
