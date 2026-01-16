import { useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme, Box, Tabs, Tab, AppBar } from '@mui/material';
import ConstituentTable from './components/ConstituentTable';
import WardAnalytics from './components/WardAnalytics';
import AuditHistory from './components/AuditHistory';

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
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Tabs value={activeTab} onChange={handleTabChange} textColor="inherit" indicatorColor="secondary">
            <Tab label="Constituents Management" />
            <Tab label="Ward Analytics" />
            <Tab label="Audit History" />
          </Tabs>
        </AppBar>
        <Box>
          {activeTab === 0 && <ConstituentTable />}
          {activeTab === 1 && <WardAnalytics />}
          {activeTab === 2 && <AuditHistory />}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
