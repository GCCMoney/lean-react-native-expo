import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, ActivityIndicator, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Portal } from '@gorhom/portal';

import LeanWebClient from './LeanWebClient';
import Lean from './Lean';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LinkSDK = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initializationURL, setInitializationURL] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const lean = new Lean({
    appToken: props.appToken,
    env: props.env || 'production',
    country: props.country || 'ae',
    language: props.language || 'en',
    isSandbox: props.sandbox || false,
    showLogs: props.showLogs || false,
    version: props.version || 'latest',
    customization: props.customization || null,
  });

  useImperativeHandle(ref, () => ({
    link: config => {
      setIsOpen(true);
      setInitializationURL(lean.link(config));
    },
    connect: config => {
      setIsOpen(true);
      setInitializationURL(lean.connect(config));
    },
    reconnect: config => {
      setIsOpen(true);
      setInitializationURL(lean.reconnect(config));
    },
    createBeneficiary: config => {
      setIsOpen(true);
      setInitializationURL(lean.createBeneficiary(config));
    },
    createPaymentSource: config => {
      setIsOpen(true);
      setInitializationURL(lean.createPaymentSource(config));
    },
    updatePaymentSource: config => {
      setIsOpen(true);
      setInitializationURL(lean.updatePaymentSource(config));
    },
    pay: config => {
      setIsOpen(true);
      setInitializationURL(lean.pay(config));
    },
  }));

  const responseCallbackHandler = data => {
    setTimeout(() => setIsOpen(false), 300);
    if (props.callback) {
      props.callback(data);
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    LeanWebClient.onPageStarted();
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    LeanWebClient.onPageFinished();
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalBackground} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
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
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
        </View>
      </View>
    </Portal>
  );
});

LinkSDK.defaultProps = {
  webViewProps: {},
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'white',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default LinkSDK;