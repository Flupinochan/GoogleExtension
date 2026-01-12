import "@fontsource/material-icons";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { withThemeFromJSXProvider } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import { Renderer } from "storybook/internal/csf";
import { fn, sb } from "storybook/test";

// storage.tsはモックしない（LANGUAGESを使用するため）
sb.mock(import("../entrypoints/utils/retry.ts"), { spy: true });
sb.mock(import("../entrypoints/utils/messaging.ts"), { spy: true });

// @ts-ignore
globalThis.storage = {
  defineItem: (key: string, options: any) => ({
    getValue: fn().mockResolvedValue(options.init()),
    setValue: fn().mockResolvedValue(undefined),
  }),
};

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
  typography: {
    body1: {
      fontSize: "16px",
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    body1: {
      fontSize: "16px",
    },
  },
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
  decorators: [
    withThemeFromJSXProvider<Renderer>({
      themes: {
        light: lightTheme,
        dark: darkTheme,
      },
      defaultTheme: "light",
      Provider: ThemeProvider,
      GlobalStyles: CssBaseline,
    }),
  ],
};

export default preview;
