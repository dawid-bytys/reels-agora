import { StyleSheet, View } from 'react-native';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '~/constants/dimensions';
import {
  RenderModeType,
  RtcSurfaceView,
  VideoSourceType,
} from 'react-native-agora';
import type { Live } from '~/http/responses/livesResponse';

interface ReelProps {
  live: Live;
  isActive: boolean;
  remoteUid: number | null;
}

export function Reel({ live, isActive, remoteUid }: ReelProps) {
  return (
    <View style={styles.container}>
      {isActive && remoteUid != null && (
        <RtcSurfaceView
          connection={{ channelId: live.agora_channel }}
          style={styles.video}
          canvas={{
            uid: remoteUid,
            sourceType: VideoSourceType.VideoSourceRemote,
            renderMode: RenderModeType.RenderModeHidden,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: SCREEN_HEIGHT,
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
