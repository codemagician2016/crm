// pages/dashboard.js
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { People, AttachMoney, TrendingDown, Email, HowToReg, GroupRemove } from '@mui/icons-material';
// import { BarChart, PieChart } from '@mui/x-charts';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { Container, Row, Col } from 'react-bootstrap';
import { ReactNode, useEffect, useState } from 'react';
import Select from 'react-select';
import dynamic from 'next/dynamic';
import Api from '@/utils/helper/api';
import Loader from '@/commoncomponent/Loader';
import CustomDateRangePicker from '@/commoncomponent/CustomDateRangePicker';
import moment from 'moment';
import { customSelectStyles } from '@/utils/helper';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAppSelector } from '../../redux/storeHooks';
import { getAuthSlice } from '../../redux/slices/authSlice';
import { IUserData } from '@/utils/interfaces/user';
import { UserRoles } from '@/utils/helper/constants';


// Define types for the SummaryCard props
interface SummaryCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: string;
}

const SummaryCard = ({ title, value, icon, color }: SummaryCardProps) => {
  return (
    <Card className='shadow-none' sx={{ minWidth: 275, mb: 2, backgroundColor: color, color: 'white' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <div>
            <Typography variant="h5" component="div">
              {value}
            </Typography>
            <Typography variant="body2">
              {title}
            </Typography>
          </div>
          {icon}
        </Box>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const api = new Api();
  const authSlice = useAppSelector(getAuthSlice);
  const userData: IUserData | null = authSlice ? authSlice?.userData : null;
  const [statFilters, setStatFilters] = useState<any>({
    start_date: moment().startOf("month").toDate(),
    end_date: moment().endOf("month").toDate(),
    selected_employee: null,
  });
  const [monthlySalesFilters, setMonthlySalesFilters] = useState<any>({
    year: moment().toDate(),
  });
  const [leadsFilters, setLeadsFilters] = useState<any>({
    start_date: moment().startOf("month").toDate(),
    end_date: moment().endOf("month").toDate(),
  });
  const [employeeList, setEmployeeList] = useState<any>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [dashboardMonthlySales, setDashboardMonthlySales] = useState<any>([]);
  const [leadCounts, setLeadCounts] = useState<any>([]);
  const [isEmployeeLoading, setIsEmployeeLoading] = useState<boolean>(false);
  const [isStatLoading, setIsStatLoading] = useState<boolean>(false);
  const [isMonthlySalesLoading, setIsMonthlySalesLoading] = useState<boolean>(false);
  const [isLeadCountsLoading, setIsLeadCountsLoading] = useState<boolean>(false);

  const handleStatEmployeeSelection = (data: any) => {

    setStatFilters({
      ...statFilters,
      selected_employee: data || null,
    });
  }

  const handleStatRangeFilterChange = (rangeKey: any) => {
    const startDate = rangeKey?.range1?.startDate;
    const endDate = rangeKey?.range1?.endDate;

    setStatFilters({
      ...statFilters,
      start_date: startDate || null,
      end_date: endDate || null,
    });
  };

  const handleLeadRangeFilterChange = (rangeKey: any) => {
    const startDate = rangeKey?.range1?.startDate;
    const endDate = rangeKey?.range1?.endDate;

    setLeadsFilters({
      ...leadsFilters,
      start_date: startDate || null,
      end_date: endDate || null,
    });
  };

  const handleMonthlySalesYearChange = (date: any) => {
    setMonthlySalesFilters({
      ...monthlySalesFilters,
      year: date,
    });
  };

  const getEmployeeData = async (search: string = '') => {
    try {
      setIsEmployeeLoading(true);
      const res = await api.get(`/user`, { search });
      if (res?.status == 200) {
        const updatedData = res?.data?.data;
        setEmployeeList(updatedData || []);
      } else {
        setEmployeeList([]);
      }
      setIsEmployeeLoading(false);
    } catch (error: any) {
      setIsEmployeeLoading(false)
    }
  }

  const getDashboardStats = async () => {
    try {
      setIsStatLoading(true);
      let params = {
        start_date: statFilters?.start_date ? moment(statFilters?.start_date).format('YYYY-MM-DD') : null,
        end_date: statFilters?.end_date ? moment(statFilters?.end_date).format('YYYY-MM-DD') : null,
        employeeId: statFilters?.selected_employee?._id || null,
      }
      const res = await api.get(`/dashboard/stats`, params);
      if (res?.status == 200) {
        const updatedData = res?.data?.data;
        setDashboardStats(updatedData || {});
      } else {
        setDashboardStats({});
      }
      setIsStatLoading(false);
    } catch (error: any) {
      setIsStatLoading(false)
    }
  }

  const getMonthlySales = async () => {
    try {
      setIsMonthlySalesLoading(true);
      let params = {
        year: monthlySalesFilters?.year ? moment(monthlySalesFilters?.year).format('YYYY') : null,
      }
      const res = await api.get(`/dashboard/monthly-sales`, params);
      if (res?.status == 200) {
        const updatedData = res?.data?.data || [];
        setDashboardMonthlySales(updatedData || []);
      } else {
        setDashboardMonthlySales([]);
      }
      setIsMonthlySalesLoading(false);
    } catch (error: any) {
      setIsMonthlySalesLoading(false)
    }
  }

  const getLeadCounts = async () => {
    try {
      setIsLeadCountsLoading(true);
      let params = {
        start_date: leadsFilters?.start_date ? moment(leadsFilters?.start_date).format('YYYY-MM-DD') : null,
        end_date: leadsFilters?.end_date ? moment(leadsFilters?.end_date).format('YYYY-MM-DD') : null,
      }
      const res = await api.get(`/lead/counts`, params);
      if (res?.status == 200) {
        const updatedData: any = [];
        Object.entries(res?.data?.data?.counts || {}).forEach(([key, value], index) => {
          console.log("lead", key, value)
          updatedData.push({
            id: index,
            label: key,
            value: value,
          });
        });
        setLeadCounts(updatedData || []);
      } else {
        setLeadCounts([]);
      }
      setIsLeadCountsLoading(false);
    } catch (error: any) {
      setIsLeadCountsLoading(false)
    }
  }

  useEffect(() => {
    getDashboardStats();
  }, [statFilters])

  useEffect(() => {
    getMonthlySales();
  }, [monthlySalesFilters])

  useEffect(() => {
    getLeadCounts();
  }, [leadsFilters])

  useEffect(() => {
    getEmployeeData();
  }, [])

  const isAdmin = ((userData?.role === UserRoles.ADMIN) || (userData?.role === UserRoles.SUPER_ADMIN));

  return (
    <Container>
      <div className="main p-3">
        <Row className='justify-content-between align-items-center mb-3'>
          <Col sm={6}>
            <h2 className='title'>Dashboard Overview</h2>
          </Col>
          <Col sm={3} className='d-flex justify-content-end'>
            <CustomDateRangePicker
              startDate={statFilters?.start_date}
              endDate={statFilters?.end_date}
              handleDateRangeChange={handleStatRangeFilterChange}
              classes='w-100'
            />
          </Col>
          {
            (isAdmin) && (
              <Col sm={3} className=''>
                <Select
                  className="cstm-search-select-container"
                  classNamePrefix="cstm-search-select"
                  options={employeeList || []}
                  getOptionLabel={(option: any) => option?.name || 'NA'}
                  getOptionValue={(option: any) => option?._id}
                  styles={customSelectStyles}
                  onChange={(newValue: any) => handleStatEmployeeSelection(newValue)}
                  onInputChange={(newValue: any, actionMeta: any) => {
                    if (actionMeta.action === 'input-change') {
                      getEmployeeData(newValue);
                    }
                  }}
                  value={statFilters?.selected_employee || null}
                  isLoading={isEmployeeLoading || false}
                  placeholder={`Select Employee`}
                  isClearable
                  menuShouldScrollIntoView={false}
                  menuPosition="fixed"
                />
              </Col>
            )
          }
        </Row>

        <Row>
          <Col md={3}>
            <SummaryCard
              title="Total Customers"
              value={dashboardStats?.total_leads || 0}
              icon={<People fontSize="large" />}
              color="#1976d2"
            />
          </Col>
          <Col md={3}>
            <SummaryCard
              title="Revenue"
              value={`$${dashboardStats?.total_revenue || 0}`}
              icon={<AttachMoney fontSize="large" />}
              color="#4caf50"
            />
          </Col>
          <Col md={3}>
            <SummaryCard
              title="Total Conversion"
              value={dashboardStats?.close_leads || 0}
              icon={<HowToReg fontSize="large" />}
              color="#9c27b0"
            />
          </Col>
          <Col md={3}>
            <SummaryCard
              title="Total Losts"
              value={dashboardStats?.lost_leads || 0}
              icon={<GroupRemove fontSize="large" />}
              color="red"
            />
          </Col>

        </Row>

        <Row className="mt-4">
          <Col md={8}>
            <Card className='shadow-none'>
              <CardContent>
                <div className='d-flex justify-content-between'>
                  <Typography className='heading'>
                    Monthly Sales
                  </Typography>
                  <div>
                    <DatePicker
                      selected={monthlySalesFilters?.year ? new Date(monthlySalesFilters?.year) : null}
                      onChange={handleMonthlySalesYearChange}
                      showYearPicker
                      dateFormat="yyyy"
                      yearItemNumber={8}
                      className="cstm-date-picker"
                    />
                  </div>
                </div>
                <Box height={300}>
                  <BarChart
                    dataset={dashboardMonthlySales}
                    xAxis={[{ dataKey: 'monthName' }]}
                    yAxis={[
                      {
                        label: 'Amount ($)',
                      },
                    ]}
                    series={[{ dataKey: 'totalAmount', label: 'Monthy Sales' }]}
                    height={300}
                  />
                </Box>
              </CardContent>
            </Card>
          </Col>
          <Col md={4}>
            <Card className='shadow-none'>
              <CardContent>
                <div className='d-flex justify-content-between'>
                  <Typography className='heading'>
                    Customer Segmentation
                  </Typography>
                  <CustomDateRangePicker
                    startDate={leadsFilters?.start_date}
                    endDate={leadsFilters?.end_date}
                    handleDateRangeChange={handleLeadRangeFilterChange}
                    classes='w-100'
                  />
                </div>
                <Box height={300}>
                  <PieChart
                    series={[
                      {
                        data: leadCounts,
                      },
                    ]}
                    height={300}
                  />
                </Box>
              </CardContent>
            </Card>
          </Col>
        </Row>


      </div>
    </Container>
  );
}