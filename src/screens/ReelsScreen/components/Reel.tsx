import { StyleSheet, View } from 'react-native';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../constants/dimensions';
import {
  RtcTextureView,
  RenderModeType,
  VideoSourceType,
} from 'react-native-agora';
import type { Live } from '../../../http/responses/livesResponse';

interface ReelProps {
  live: Live;
  isActive: boolean;
  remoteUid: number | null;
}

export function Reel({ live, isActive, remoteUid }: ReelProps) {
  return (
    <View style={styles.container}>
      {isActive && remoteUid != null && (
        <RtcTextureView
          style={StyleSheet.absoluteFill}
          connection={{ channelId: live.agora_channel }}
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
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'black',
  },
});
