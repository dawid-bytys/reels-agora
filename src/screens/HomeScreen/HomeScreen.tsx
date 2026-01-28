import { Button, StyleSheet, Text, View } from 'react-native';
import { useLivesQuery } from '../../http/queries/useLivesQuery';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigators/RootNavigator';
import type { Live } from '../../http/responses/livesResponse';

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { data, isPending, isRefetching, isError, refetch } = useLivesQuery();

  const handleNavigateToReels = (lives: Live[]) => {
    navigation.navigate('ReelsScreen', { lives });
  };

  return (
    <View style={styles.container}>
      {isPending || isRefetching ? (
        <Text style={styles.text}>Loading...</Text>
      ) : isError ? (
        <Text style={styles.text}>Something went wrong</Text>
      ) : (
        <View style={styles.livesContainer}>
          <Text style={styles.text}>Currently live: {data.items.length}</Text>
          <Button
            title="Navigate to Reels"
            onPress={() => handleNavigateToReels(data.items)}
          />
        </View>
      )}
      <Button title="Refresh" onPress={() => refetch()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  livesContainer: {
    gap: 10,
  },
});
