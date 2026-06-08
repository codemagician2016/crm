// import { Tabs, Tab } from 'react-bootstrap';

import { ReactNode } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import Backdrop from '../Backdrop';

interface ITabComponent<T> {
    tabs: T[],
    tabContent: ReactNode,
    selectedTab: string,
    handleTabChange: (key: string) => void,
    isLoading: boolean
}

const TabComponent = <T,>({ tabs, tabContent, selectedTab, handleTabChange, isLoading }: ITabComponent<T>) => {
    return (
        // <Tabs activeKey={selectedTab} onSelect={(key) => key && handleTabChange(key)} id="uncontrolled-tab-example" className="mb-3">
        //     {
        //         tabs.map((tab: any, index: number) => (
        //             <Tab eventKey={tab.key} title={tab.title} key={index}>
        //                 {tabContent}
        //             </Tab>
        //         ))
        //     }

        // </Tabs>
        <div>
            <Box sx={{ bgcolor: 'background.paper' }}>
                <Tabs
                    value={selectedTab}
                    onChange={(event, newValue) => handleTabChange(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="scrollable auto tabs example"
                >
                    {
                        tabs.map((tab: any, index: number) => (
                            <Tab label={tab.title} value={tab.key} key={index}>
                            </Tab>
                        ))
                    }
                </Tabs>
                {
                    isLoading && < Backdrop isShow={isLoading} />
                }
            </Box>
            <div className='mt-2'>
                {tabContent}
            </div>
        </div>
    )
}

export default TabComponent;