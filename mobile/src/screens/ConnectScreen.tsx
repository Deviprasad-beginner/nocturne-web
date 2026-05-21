import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function ConnectScreen() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 items-center justify-center">
        <Text className="text-rose-400 text-3xl font-bold mb-2">Connect</Text>
        <Text className="text-gray-400 text-base">Find others wandering the dark</Text>
      </View>
    </SafeAreaView>
  );
}
