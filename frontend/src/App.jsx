import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ConstituentTable from './components/ConstituentTable';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ConstituentTable />
    </ThemeProvider>
  );
}

export default App;
