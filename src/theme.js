import { createTheme } from '@mui/material/styles';
import { heIL } from '@mui/material/locale';

const palette = {
  primary: {
    main: '#395035',
    contrastText: '#f8f3e7',
  },
  secondary: {
    main: '#6c8c68',
    contrastText: '#f8f3e7',
  },
  background: {
    default: '#f8f3e7',
    paper: '#fffdf4',
  },
  text: {
    primary: '#395035',
    secondary: '#6c8c68',
  },
  divider: '#cdd3c4',
};

const theme = createTheme(
  {
    direction: 'rtl',
    palette,
    typography: {
      fontFamily: "'Doran', 'Inter', 'Vazirmatn', 'Segoe UI', Arial, sans-serif",
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.background.default,
            color: palette.text.primary,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: palette.background.paper,
            boxShadow: '0 20px 45px rgba(57, 80, 53, 0.08)',
            border: '1px solid rgba(57, 80, 53, 0.08)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: palette.background.paper,
            borderRadius: 20,
            boxShadow: '0 15px 35px rgba(57, 80, 53, 0.07)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingInline: 20,
          },
          containedPrimary: {
            boxShadow: '0 8px 18px rgba(57, 80, 53, 0.25)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: palette.background.paper,
            color: palette.text.primary,
            boxShadow: '0 12px 30px rgba(57, 80, 53, 0.08)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          filled: {
            backgroundColor: '#e3e8dd',
            color: palette.text.primary,
          },
        },
      },
    },
  },
  heIL
);

export default theme;

