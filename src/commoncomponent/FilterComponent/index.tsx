import { Checkbox } from '@mui/material';
import React, { useState } from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import { FiFilter } from "react-icons/fi";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { IoTrashBinOutline } from "react-icons/io5";
import { TbFilterShare } from "react-icons/tb";

interface IFilter {
    appliedFilters: any,
    selectedFilterData: any,
    handleFilterSelect: (data: any) => void,
    selectedFilterInfo: any,
    updateSelectedFilterInfo: (type: string) => void,
    filterKeys: any[],
}

const FilterComponent = ({ appliedFilters, handleFilterSelect, selectedFilterData, selectedFilterInfo,
    updateSelectedFilterInfo, filterKeys }: IFilter) => {
    const [filterType, setFilterType] = useState(selectedFilterInfo?.key);

    const getFilterData = () => {
        let data = [];
        data = selectedFilterData?.data || [];

        return selectedFilterData || [];
    }

    const handleFilterTypeChange = (type: any) => {
        setFilterType(type);
        updateSelectedFilterInfo(type);
    }

    const getFiltersCount = () => {
        let count = 0;
        (filterKeys || [])?.map(filter => {
            if (appliedFilters[filter?.value]?.length) {
                count += 1;
            }
        });

        return count;
    }

    const filterCount = getFiltersCount(); 

    return (
        <div className=''>
            <div className="d-flex align-items-center" style={{ width: "90%" }}>
                <div className={`filterContainer`}>
                    <Dropdown className='filter-dropdown' autoClose="outside">
                        <Dropdown.Toggle variant="transparent-btn" id="dropdown-basic">
                            <Button className='range'>
                                <div><TbFilterShare style={{ fontSize: 14, marginRight: 8 }} />  </div>
                                <div>Filter {filterCount > 0 ? `(${filterCount})` : ''}</div>
                            </Button>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className={`shadow2 dropbx filter-menu`}>
                            <div className="d-flex">
                                <div className={`filter-keys`}>
                                    {
                                        (filterKeys || [])?.map(item => (
                                            <div className={`filter-box ${filterType === item?.value ? "filter-box--active" : ''} `} onClick={() => handleFilterTypeChange(item?.value)} key={item?.value}>
                                                <span className="filter-label">{item?.label}</span>
                                                <MdOutlineKeyboardArrowRight />
                                            </div>
                                        ))
                                    }

                                </div>
                                <div className="filter-body">
                                    <div>

                                        <div style={{ height: '320', overflow: "hidden", position: "relative" }}>
                                            <div className={`filter-body-value `} >
                                                {
                                                    (getFilterData() || []).map((val: any) => (
                                                        <div className={`filter-option`} key={val?.value}>
                                                            <Checkbox className="" checked={(appliedFilters[filterType] || [])?.find((item: any) => item?.value == val?.value) || false}
                                                                onChange={(e: any) => handleFilterSelect({ item: val, filterType, isChecked: e?.target?.checked })} />

                                                            <div className="">{val?.label}</div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        </div>
    )
}

export default FilterComponent;