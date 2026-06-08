import React from "react";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const SaveLoader = ({ isShow = false }) => {

    return (
        <Backdrop
            sx={{ zIndex: (theme: any) => theme.zIndex.drawer + 1 }}
            open={isShow}
        >
            <CircularProgress className="save-loader" color="inherit" />
        </Backdrop>
    );
};

export default SaveLoader;