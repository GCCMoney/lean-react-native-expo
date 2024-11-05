import React, { forwardRef, useImperativeHandle, useState, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import BottomSheet from '@gorhom/bottom-sheet';

import LeanWebClient from './LeanWebClient';
import Lean from './Lean';

const LinkSDK = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initializationURL, setInitializationURL] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['95%'], []);

  const lean = useMemo(() => new Lean({
    appToken: props.appToken,
    env: props.env || 'production',
    country: props.country || 'ae',
    language: props.language || 'en',
    isSandbox: props.sandbox || false,
    showLogs: props.showLogs || false,
    version: props.version || 'latest',
    customization: props.customization || null,
  }), [props.appToken, props.env, props.country, props.language, props.sandbox, props.showLogs, props.version, props.customization]);

  const openBottomSheet = useCallback((url) => {
    setInitializationURL(url);
    setIsOpen(true);
    setTimeout(() => {
      bottomSheetRef.current?.expand();
    }, 100);
  }, []);

  const closeBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setTimeout(() => {
      setIsOpen(false);
      setInitializationURL('');
    }, 300);
  }, []);

  useImperativeHandle(ref, () => ({
    link: config => openBottomSheet(lean.link(config)),
    connect: config => openBottomSheet(lean.connect(config)),
    reconnect: config => openBottomSheet(lean.reconnect(config)),
    createBeneficiary: config => openBottomSheet(lean.createBeneficiary(config)),
    createPaymentSource: config => openBottomSheet(lean.createPaymentSource(config)),
    updatePaymentSource: config => openBottomSheet(lean.updatePaymentSource(config)),
    pay: config => openBottomSheet(lean.pay(config)),
  }), [lean, openBottomSheet]);

  const responseCallbackHandler = useCallback((data) => {
    closeBottomSheet();
    if (props.callback) {
      props.callback(data);
    }
  }, [closeBottomSheet, props.callback]);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    LeanWebClient.onPageStarted();
  }, []);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    LeanWebClient.onPageFinished();
  }, []);

  if (!isOpen) return null;

  return (
    <View style={styles.container}>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={closeBottomSheet}
        index={0}

        handleIndicatorStyle={{ display: 'none' }}
        handleStyle={{

          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
        backgroundStyle={{
          backgroundColor: '#FFFFFF',
        }}
      >
        <View style={styles.contentContainer}>
          <WebView
            {...props.webViewProps}
            style={styles.webView}
            originWhitelist={['*']}
            source={{ uri: initializationURL }}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            onShouldStartLoadWithRequest={request =>
              LeanWebClient.handleOverrideUrlLoading(request, responseCallbackHandler)
            }
            cacheEnabled={false}
            javaScriptEnabledAndroid={true}
            javaScriptCanOpenWindowsAutomatically
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
          />
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000000" />
            </View>
          )}
        </View>
      </BottomSheet>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',

  },
  contentContainer: {
    flex: 1,

  },
  webView: {
    flex: 1,


  },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default LinkSDK;
