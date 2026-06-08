import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { Breadcrumb, Button, Card, Container, Form, Table } from 'react-bootstrap'
import { FaEdit } from 'react-icons/fa'
import { IoMdAdd } from 'react-icons/io'
import { MdDelete } from 'react-icons/md'
import { PrimaryButton } from '@/commoncomponent/Button';
import CustomTable from '@/commoncomponent/Table';
import Api from '@/utils/helper/api';
import { IInventoryData } from '@/utils/interfaces/inventory';
import Backdrop from '@/commoncomponent/Backdrop';
import { UserRoles } from '@/utils/helper/constants';
import { getAuthSlice } from '../../../redux/slices/authSlice';
import { IUserData } from '@/utils/interfaces/user';
import { useAppSelector } from '../../../redux/storeHooks';
import { DEFAULT_PAGE_ITEMS } from '@/utils/helper';

export default function Inventory() {
  const router = useRouter();

  const [inventoryList, setInventoryListt] = useState<IInventoryData[]>([]);
  const [inventoryRes, setInventoryRes] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [productType, setProductType] = useState('');
  const api = new Api();
  const authSlice = useAppSelector(getAuthSlice);
  const userData: IUserData | null = authSlice ? authSlice?.userData : null;

  const getInventoryData = async () => {
    try {
      setIsLoading(true);
      let params: any = {
        page: currentPage,
        limit: DEFAULT_PAGE_ITEMS,
      }
      if (productType) {
        params.productType = productType;
      }
      const res = await api.get(`/inventory`, params);
      if (res?.status == 200) {
        const updatedData = res?.data?.data;
        setInventoryListt(updatedData || []);
        setInventoryRes(res?.data);
      } else {
        setInventoryListt([]);
        setInventoryRes(null);
      }
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false)
      setShowBackdrop(false);
    }
  }
  
  const handleTypeChange = (value: any) => {
    setCurrentPage(1);
    setProductType(value);
  }

  useEffect(() => {
    getInventoryData();
  }, [productType, currentPage])

  const getTableData = () => {
    const isNotSalesRep = userData?.role !== UserRoles.SALESREP;

    return {
      labels: isNotSalesRep
        ? ['Product Name', 'Product Type', 'Price', 'Tax', 'SKU', 'Action']
        : ['Product Name', 'Product Type', 'Price', 'Tax', 'SKU'],
      colData: inventoryList.map((item) => ({
        colData: {
          name: item.name,
          productType: item.productType,
          price: item.price,
          tax: item.tax,
          sku: item.sku,
          ...(isNotSalesRep && {
            action: {
              display: (
                <div className='d-flex align-items-center'>
                  <Button className="deleteBtn" variant="link">
                    <MdDelete />
                  </Button>
                  <Button className="editBtn" variant="link" onClick={() => handleEdit(item._id)}>
                    <FaEdit />
                  </Button>
                </div>
              ),
            },
          }),
        },
      })),
    };
  };


  const handleEdit = (id: string) => {
    router.push(`/inventory/add?inventoryId=${id}`);
  };

  return (
    <Container>
      <div className='main px-0'>
        <Breadcrumb className='mb-3'>
          <Breadcrumb.Item href="#" >Home / Inventory</Breadcrumb.Item>
        </Breadcrumb>

        <Card >
          <Card.Body className='p-0'>
            <Card.Header>
              <div className='d-flex justify-between align-items-center'>
                <Form.Select
                  className="empType"
                  aria-label="Role select"
                  value={productType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="service">Service</option>
                  <option value="product">Product</option>
                </Form.Select>
                <div>
                  {userData?.role !== UserRoles.SALESREP && <PrimaryButton label='Add Inventory' onClick={() => router.push('/inventory/add')} icon={<IoMdAdd style={{ fontSize: 20, marginRight: 3 }} />} isDisabled={false} />}
                </div>
              </div>
            </Card.Header>
            <CustomTable
              tableData={getTableData()}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={inventoryRes?.totalPages || 1}
              isLoading={isLoading}
            />
            {
              isLoading && < Backdrop isShow={isLoading} />
            }
          </Card.Body>
        </Card>
      </div>
    </Container>
  )
}
