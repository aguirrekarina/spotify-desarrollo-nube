import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import GenreManagement from '../components/admin/GenreManagement';
import ArtistManagement from '../components/admin/ArtistManagement';
import SongManagement from '../components/admin/SongManagement';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
};

const AdminPage: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Panel de Administración
            </Typography>

            <Paper elevation={2}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Géneros" />
                    <Tab label="Artistas" />
                    <Tab label="Canciones" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <GenreManagement />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <ArtistManagement />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <SongManagement />
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default AdminPage;