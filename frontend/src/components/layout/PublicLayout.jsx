import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from '../common/WhatsAppButton';
import { fetchSettings } from '../../store/slices/settingSlice';

const PublicLayout = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings.settings);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton phoneNumber={settings?.whatsapp_number || '212XXXXXXXXX'} />
    </div>
  );
};

export default PublicLayout;
