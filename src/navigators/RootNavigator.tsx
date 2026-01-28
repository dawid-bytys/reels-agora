import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen/HomeScreen';
import { ReelsScreen } from '../screens/ReelsScreen/ReelsScreen';
import type { Live } from '../http/responses/livesResponse';

export type RootStackParamList = {
  HomeScreen: undefined;
  ReelsScreen: { lives: Live[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="ReelsScreen" component={ReelsScreen} />
    </Stack.Navigator>
  );
}
