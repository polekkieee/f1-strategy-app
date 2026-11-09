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
  export const StyleSheet = {
    create: (styles) => styles,
  };
\`);

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'react-native') {
    return {
      format: 'module',
      shortCircuit: true,
      url: reactNativeMockUrl,
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
