import React from "react";
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const Loader = ({ size = 20 }) => {

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={size} color="inherit" />
        </Box>
    );
};

export default Loader;