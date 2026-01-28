import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  View,
  ViewToken,
} from 'react-native';
import { IS_ANDROID } from '~/constants/platform';
import { useRoute, useIsFocused } from '@react-navigation/native';
import { SCREEN_HEIGHT } from '~/constants/dimensions';
import createAgoraRtcEngine, {
  AgoraPipOptions,
  AgoraPipState,
  AgoraPipStateChangedObserver,
  ChannelProfileType,
  IRtcEngine,
  IRtcEngineEventHandler,
  RenderModeType,
  VideoSourceType,
  VideoViewSetupMode,
  VideoMirrorModeType,
} from 'react-native-agora';
import { Reel } from './components/Reel';
import type { RouteProp } from '@react-navigation/native';
import type { Live } from '../../http/responses/livesResponse';
import type { RootStackParamList } from '../../navigators/RootNavigator';

export function ReelsScreen() {
  const {
    params: { lives },
  } = useRoute<RouteProp<RootStackParamList, 'ReelsScreen'>>();

  const isFocused = useIsFocused();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const [isEngineReady, setIsEngineReady] = useState(false);

  const [pipState, setPipState] = useState<number>(
    AgoraPipState.pipStateStopped,
  );
  const [isPipDisposed, setIsPipDisposed] = useState(false);

  const listRef = useRef<FlatList<Live>>(null);
  const currentIndexRef = useRef(0);
  const engineRef = useRef<IRtcEngine>(createAgoraRtcEngine());
  const channelRef = useRef<string | null>(null);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });

  const pipObserver = useMemo(() => {
    const observer: AgoraPipStateChangedObserver = {
      onPipStateChanged: state => {
        if (state === AgoraPipState.pipStateFailed) {
          engineRef.current.getAgoraPip().pipDispose();
          setIsPipDisposed(true);
          setPipState(AgoraPipState.pipStateStopped);
          return;
        }

        setPipState(state);
      },
    };

    return observer;
  }, []);

  const eventHandler = useMemo(() => {
    const handler: IRtcEngineEventHandler = {
      onUserJoined: (connection, uid) => {
        const currentLive = lives[currentIndexRef.current];
        if (currentLive == null) {
          return;
        }

        if (connection.channelId !== currentLive.agora_channel) {
          return;
        }

        setRemoteUid(uid);
      },
      onUserOffline: () => {
        setRemoteUid(null);
      },
      onLeaveChannel: () => {
        setRemoteUid(null);
      },
    };

    return handler;
  }, [lives]);

  const setupPip = useCallback(() => {
    const engine = engineRef.current;
    if (isPipDisposed) {
      return;
    }

    const live = lives[currentIndexRef.current];
    if (live === null) {
      return;
    }

    let options: AgoraPipOptions = {
      autoEnterEnabled: engine.getAgoraPip().pipIsAutoEnterSupported(),
    };

    if (IS_ANDROID) {
      options = {
        ...options,
        aspectRatioX: 9,
        aspectRatioY: 16,
        sourceRectHintLeft: 0,
        sourceRectHintTop: 0,
        sourceRectHintRight: 1080,
        sourceRectHintBottom: 1920,
        seamlessResizeEnabled: true,
      };
    } else {
      const videoStreams =
        remoteUid === null
          ? []
          : [
              {
                connection: {
                  channelId: live.agora_channel,
                  localUid: remoteUid,
                },

                canvas: {
                  uid: remoteUid,
                  sourceType: VideoSourceType.VideoSourceRemote,
                  setupMode: VideoViewSetupMode.VideoViewSetupAdd,
                  renderMode: RenderModeType.RenderModeHidden,
                  mirrorMode: VideoMirrorModeType.VideoMirrorModeDisabled,
                },
              },
            ];

      options = {
        ...options,
        preferredContentWidth: 200,
        preferredContentHeight: 360,
        sourceContentView: 0,
        contentView: 0,
        videoStreams,
        controlStyle: 2,
      };
    }

    engine.getAgoraPip().pipSetup(options);
  }, [isPipDisposed, lives, remoteUid]);

  const updateCurrentIndex = useCallback(
    (nextIndex: number) => {
      const maxIndex = Math.max(0, lives.length - 1);
      const clampedIndex = Math.max(0, Math.min(nextIndex, maxIndex));

      if (clampedIndex === currentIndexRef.current) {
        return;
      }

      currentIndexRef.current = clampedIndex;
      setCurrentIndex(clampedIndex);
    },
    [lives.length],
  );

  const handleViewableVideoChange = useCallback(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      const nextIndex = viewableItems[0]?.index;
      if (nextIndex == null || lives.length === 0) {
        return;
      }

      updateCurrentIndex(nextIndex);
    },
    [updateCurrentIndex, lives.length],
  );

  const handleMomentumScrollBegin = useCallback(() => {
    setIsScrollEnabled(false);
  }, []);

  const handleMomentumScrollEnd = useCallback(() => {
    setIsScrollEnabled(true);
  }, []);

  // Handle initializing the engine
  useEffect(() => {
    const engine = engineRef.current;

    engine.initialize({
      appId: 'YOUR APP ID',
      channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
    });
    engine.registerEventHandler(eventHandler);
    engine.enableVideo();
    engine.getAgoraPip().registerPipStateChangedObserver(pipObserver);

    setIsEngineReady(true);

    // Cleanup on screen unmount
    return () => {
      setIsEngineReady(false);

      engine.getAgoraPip().unregisterPipStateChangedObserver(pipObserver);
      engine.getAgoraPip().release();
      engine.getAgoraPip().pipDispose();

      engine.unregisterEventHandler(eventHandler);
      engine.leaveChannel();
      engine.release();
    };
  }, [eventHandler, pipObserver]);

  // Handle joining and leaving the channel on reel change
  useEffect(() => {
    const engine = engineRef.current;
    if (!isEngineReady) {
      return;
    }

    const live = lives[currentIndex];
    if (live === null) {
      return;
    }

    // Only rejoin if the channel has actually changed
    const currentChannel = channelRef.current;
    if (currentChannel === live.agora_channel) {
      return;
    }

    channelRef.current = live.agora_channel;

    engine.leaveChannel();
    engine.joinChannel(live.agora_token, live.agora_channel, 0, {
      autoSubscribeAudio: true,
      autoSubscribeVideo: true,
      channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
    });
  }, [currentIndex, isEngineReady, isFocused, lives, pipState]);

  // Handle setting up the PiP
  useEffect(() => {
    if (!isEngineReady) {
      return;
    }

    if (remoteUid === null) {
      return;
    }

    setupPip();
  }, [isEngineReady, remoteUid, setupPip]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Live>) => {
      const isActive = index === currentIndex;

      return <Reel live={item} isActive={isActive} remoteUid={remoteUid} />;
    },
    [currentIndex, remoteUid],
  );

  const keyExtractor = useCallback((item: Live) => item.external_id, []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={lives}
        renderItem={renderItem}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        viewabilityConfig={viewabilityConfig.current}
        onViewableItemsChanged={handleViewableVideoChange}
        keyExtractor={keyExtractor}
        bounces={false}
        snapToInterval={IS_ANDROID ? SCREEN_HEIGHT : undefined}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        scrollEnabled={isScrollEnabled}
        removeClippedSubviews={IS_ANDROID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: SCREEN_HEIGHT,
    backgroundColor: 'black',
  },
});
