import { Outlet } from 'react-router-dom';
import MobileLayout from './MobileLayout';
import MusicPlayer from './MusicPlayer';
import WelcomePopup from './WelcomePopup';
import ServicePopup from './ServicePopup';
import { useState } from 'react';

export default function Layout() {
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);

  return (
    <MobileLayout onServiceClick={() => setServiceOpen(true)}>
      <Outlet />
      <MusicPlayer />
      <WelcomePopup open={welcomeOpen} onOpenChange={setWelcomeOpen} />
      <ServicePopup open={serviceOpen} onOpenChange={setServiceOpen} />
    </MobileLayout>
  );
}
