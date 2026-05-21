import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function DiscoverScreen() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 items-center justify-center">
        <Text className="text-amber-400 text-3xl font-bold mb-2">Discover</Text>
        <Text className="text-gray-400 text-base">Go further than you planned</Text>
      </View>
    </SafeAreaView>
  );
}
