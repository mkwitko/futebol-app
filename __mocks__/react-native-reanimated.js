// Mock manual do react-native-reanimated para testes.
//
// A partir do Reanimated 4 (que roda sobre `react-native-worklets`), o mock
// oficial da lib (`react-native-reanimated/mock`) ainda importa a cadeia real
// de inicialização nativa (`NativeWorklets.native.ts`), que não existe em
// Jest — e corrigir isso exigiria um `resolver` Jest customizado, o que por
// sua vez quebra a resolução de arquivos `.ios.tsx` de outros pacotes (ex.:
// `expo-router`/`expo-glass-effect`) usada pelo preset `@react-native/jest-preset`.
// Mais simples e isolado: um mock mínimo, síncrono, cobrindo só a API que os
// componentes do app usam (shared values, `useAnimatedStyle`, animações
// "instantâneas", `Animated.View`).
const React = require("react");
const { View, Text, Image, ScrollView } = require("react-native");

function useSharedValue(initialValue) {
  return React.useRef({ value: initialValue }).current;
}

function useAnimatedStyle(factory) {
  return factory();
}

function useDerivedValue(factory) {
  return { value: factory() };
}

function useReducedMotion() {
  return false;
}

// Sem thread de UI em teste: as animações "completam" de imediato com o valor final.
const withTiming = (toValue) => toValue;
const withSpring = (toValue) => toValue;
const withDelay = (_delay, animation) => animation;
const withRepeat = (animation) => animation;
const withSequence = (...animations) => animations[animations.length - 1];
const cancelAnimation = () => {};

const Animated = {
  View,
  Text,
  Image,
  ScrollView,
  createAnimatedComponent: (Component) => Component,
};

module.exports = {
  __esModule: true,
  default: Animated,
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  cancelAnimation,
  Easing: {
    linear: (t) => t,
    ease: (t) => t,
    in: (fn) => fn,
    out: (fn) => fn,
    inOut: (fn) => fn,
    quad: (t) => t,
    cubic: (t) => t,
  },
};
