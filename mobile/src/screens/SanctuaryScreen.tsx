import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function SanctuaryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 items-center justify-center">
        <Text className="text-indigo-400 text-3xl font-bold mb-2">Sanctuary</Text>
        <Text className="text-gray-400 text-base">Your private corner of the night</Text>
      </View>
    </SafeAreaView>
  );
}
