import { register } from "node:module";

if (typeof globalThis.window === "undefined") {
  const store = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => {
        store.set(key, String(value));
      },
      removeItem: (key) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
      key: (index) => Array.from(store.keys())[index] ?? null,
      get length() {
        return store.size;
      },
    },
  };
}

const loaderCode = `
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire("${import.meta.url}");
let ts;
try {
  ts = require("typescript");
} catch {}

const reactNativeMockUrl = "data:text/javascript," + encodeURIComponent(\`
  export const View = (props) => ({ type: 'View', props });
  export const Text = (props) => ({ type: 'Text', props });
  export const Pressable = (props) => ({ type: 'Pressable', props });
  export const Modal = (props) => ({ type: 'Modal', props });
  export const ScrollView = (props) => ({ type: 'ScrollView', props });
  export const Switch = (props) => ({ type: 'Switch', props });
  export const TextInput = (props) => ({ type: 'TextInput', props });
  export const ActivityIndicator = (props) => ({ type: 'ActivityIndicator', props });
  export const StyleSheet = {
    create: (styles) => styles,
  };
  let currentDims = { width: 844, height: 390, scale: 3, fontScale: 1 };
  export const __setMockDimensions = (d) => {
    currentDims = { ...currentDims, ...d };
  };
  export const useWindowDimensions = () => currentDims;
  export const Dimensions = {
    get: () => currentDims,
  };
\`);

const expoHapticsMockUrl = "data:text/javascript," + encodeURIComponent(\`
  export const NotificationFeedbackType = {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  };
  export const ImpactFeedbackStyle = {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  };
  export const notificationAsync = async () => {};
  export const impactAsync = async () => {};
  export const selectionAsync = async () => {};
\`);

const expoScreenOrientationMockUrl = "data:text/javascript," + encodeURIComponent(\`
  export const OrientationLock = {
    DEFAULT: 0,
    ALL: 1,
    PORTRAIT: 2,
    PORTRAIT_UP: 3,
    PORTRAIT_DOWN: 4,
    LANDSCAPE: 5,
    LANDSCAPE_LEFT: 6,
    LANDSCAPE_RIGHT: 7,
    OTHER: 8,
    UNKNOWN: 9,
  };
  export const lockAsync = async () => {};
  export const unlockAsync = async () => {};
\`);

const expoKeepAwakeMockUrl = "data:text/javascript," + encodeURIComponent(\`
  export const useKeepAwake = () => {};
  export const activateKeepAwakeAsync = async () => {};
  export const deactivateKeepAwake = async () => {};
\`);

const expoStatusBarMockUrl = "data:text/javascript," + encodeURIComponent(\`
  export const StatusBar = (props) => ({ type: 'StatusBar', props });
\`);

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'react-native') {
    return {
      format: 'module',
      shortCircuit: true,
      url: reactNativeMockUrl,
    };
  }

  if (specifier === 'expo-haptics') {
    return {
      format: 'module',
      shortCircuit: true,
      url: expoHapticsMockUrl,
    };
  }

  if (specifier === 'expo-screen-orientation') {
    return {
      format: 'module',
      shortCircuit: true,
      url: expoScreenOrientationMockUrl,
    };
  }

  if (specifier === 'expo-keep-awake') {
    return {
      format: 'module',
      shortCircuit: true,
      url: expoKeepAwakeMockUrl,
    };
  }

  if (specifier === 'expo-status-bar') {
    return {
      format: 'module',
      shortCircuit: true,
      url: expoStatusBarMockUrl,
    };
  }

  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (
      error.code === 'ERR_MODULE_NOT_FOUND' &&
      (specifier.startsWith('./') || specifier.startsWith('../'))
    ) {
      for (const ext of ['.ts', '.tsx', '.js']) {
        try {
          return await nextResolve(specifier + ext, context);
        } catch {}
      }
    }
    throw error;
  }
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.tsx') && ts) {
    const filePath = fileURLToPath(url);
    const source = fs.readFileSync(filePath, 'utf8');
    const result = ts.transpileModule(source, {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ESNext,
      },
    });
    return {
      format: 'module',
      source: result.outputText,
      shortCircuit: true,
    };
  }
  return await nextLoad(url, context);
}
`;

register(
  "data:text/javascript," + encodeURIComponent(loaderCode),
  import.meta.url
);
