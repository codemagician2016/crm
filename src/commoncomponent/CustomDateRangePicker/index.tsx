import React, { useState } from "react";
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import { enUS } from 'date-fns/locale';
import { Popover } from '@mui/material';
import { Button } from 'react-bootstrap';
import { TbSortAscending2Filled } from "react-icons/tb";
import moment from 'moment';

interface IDateRangePicker {
    startDate: any,
    endDate: any,
    handleDateRangeChange: (range: any) => void,
    classes: string,
}

const CustomDateRangePicker = ({ startDate, endDate, handleDateRangeChange, classes }: IDateRangePicker) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const popoverOpen = Boolean(anchorEl);

    const handleShowPicker = (event: any) => {
        setAnchorEl(event?.currentTarget);
    };

    const handleClosePicker = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Button className={`range ${classes || ''}`} onClick={handleShowPicker}>
                <div><TbSortAscending2Filled style={{ fontSize: 14, marginRight: 8 }} />  </div>
                <div>{(startDate && endDate) ? `${moment(startDate).format('DD/MM/YYYY')} - ${moment(endDate).format('DD/MM/YYYY')}` : 'DD/MM/YYYY - DD/MM/YYYY'}</div>
            </Button>
            <Popover
                id={popoverOpen ? 'simple-popover' : undefined}
                open={popoverOpen}
                anchorEl={anchorEl}
                onClose={handleClosePicker}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <DateRangePicker
                    locale={enUS}
                    ranges={[
                        {
                            startDate: startDate ? new Date(startDate) : new Date(),
                            endDate: endDate ? new Date(endDate) : new Date(),
                        }
                    ]}
                    months={1}
                    onChange={(rangeKey) => handleDateRangeChange(rangeKey)}
                    direction="vertical"
                    scroll={{ enabled: true }}
                    className='cstm-date-range-picker'
                    color='#10375C'
                    rangeColors={['#EB8317']}
                />
            </Popover>
        </>
    )
}

export default CustomDateRangePicker;