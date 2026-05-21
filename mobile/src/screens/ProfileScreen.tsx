import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 items-center justify-center">
        <Text className="text-purple-400 text-3xl font-bold mb-2">Profile</Text>
        <Text className="text-gray-400 text-base">Your nocturnal identity</Text>
      </View>
    </SafeAreaView>
  );
}
