import './index.css'
import App from './App.tsx'
import '@mantine/notifications/styles.css';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { createTheme, MantineProvider, MantineTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';


const theme = createTheme({
  primaryColor: "violet",
  primaryShade: 9,
  components: {
    Button: {
      defaultProps: {
        variant: "light"
      }
    },
    Pagination: {
      styles: (theme: MantineTheme) => ({
        control: {
          backgroundColor: "transparent",
          color: theme.colors.violet[6],
        },
      }),
    },
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme='dark'>
      <ModalsProvider>
        <Notifications />
        <App />
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>
)
