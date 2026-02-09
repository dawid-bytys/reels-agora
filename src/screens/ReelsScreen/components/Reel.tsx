import { Image, StyleSheet, View } from 'react-native';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '~/constants/dimensions';
import type { Live } from '~/http/responses/livesResponse';

interface ReelProps {
  live: Live;
  isActive: boolean;
}

export function Reel({ live, isActive }: ReelProps) {
  if (!isActive) {
    return (
      <Image source={{ uri: live.video_poster }} style={styles.container} />
    );
  }

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
