import Sidebar from '@/commoncomponent/Sidebar';
import { useAppSelector } from '../../redux/storeHooks';
import { getAuthSlice } from '../../redux/slices/authSlice';

export default function Header() {
  const authSlice = useAppSelector(getAuthSlice);

  return (
    <>
      {authSlice?.isLoggedIn && <Sidebar />}
    </>
  );
}
