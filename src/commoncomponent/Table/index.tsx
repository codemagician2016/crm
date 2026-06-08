import { Table } from "react-bootstrap";
import CustomPagination from "@/commoncomponent/pagination";
import { useState } from "react";
import Loader from "../Loader";


interface ICustomTable<T extends Record<string, unknown>> {
    tableData: {
        colData: any[],
        labels: string[]
    }
    currentPage: number,
    setCurrentPage: (page: number) => void,
    totalPages: number,
    isLoading?: boolean,
}

const CustomTable = <T extends Record<string, unknown>>({ tableData, totalPages, currentPage, setCurrentPage, isLoading = false }: ICustomTable<T>) => {

    const currentItems = tableData?.colData;

    return (
        <div>
            <Table className="custom-table" hover>
                <thead>
                    <tr>
                        {tableData?.labels?.map((val, index) => (
                            <th key={`${val}_${index}`}>{val}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {
                        isLoading
                            ? (
                                <tr>
                                    <td colSpan={tableData?.labels?.length || 1}>
                                        <div className='no-data-found'>
                                            <Loader />
                                        </div>
                                    </td>
                                </tr>
                            )
                            : currentItems?.length
                                ? currentItems?.map((val, index) => (
                                    <tr key={index}>
                                        {Object.keys(val?.colData).map((key, colIndex) => (
                                            <td key={`${key}_${colIndex}`}>{typeof val?.colData[key] === "object" ? val?.colData[key].display : val?.colData[key]}</td>
                                        ))}
                                    </tr>
                                ))
                                : (
                                    <tr>
                                        <td colSpan={tableData?.labels?.length || 1}>
                                            <div className='no-data-found'>
                                                No Data Found
                                            </div>
                                        </td>
                                    </tr>
                                )
                    }
                </tbody>
            </Table>
            <div className="d-flex justify-content-end py-3">
                <CustomPagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>

    )
}

export default CustomTable;