import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext({
  settings: { whatsapp_number: '+91 97110 22075' },
  whatsappNumber: '+91 97110 22075',
  whatsappLink: 'https://wa.me/919711022075',
  refreshSettings: async () => {},
  loading: false,
  isLeadModalOpen: false,
  leadModalStudio: 'Gurugram HQ',
  openLeadModal: () => {},
  closeLeadModal: () => {},
});

export const formatWhatsAppDigits = (phone) => {
  if (!phone) return '919711022075';
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned || '919711022075';
};

export const getWhatsAppLink = (phone) => {
  const digits = formatWhatsAppDigits(phone);
  return `https://wa.me/${digits}`;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    whatsapp_number: '+91 97110 22075',
  });
  const [loading, setLoading] = useState(true);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadModalStudio, setLeadModalStudio] = useState('Gurugram HQ');

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({
          ...prev,
          ...data,
          whatsapp_number: data.whatsapp_number || prev.whatsapp_number || '+91 97110 22075',
        }));
      }
    } catch (err) {
      console.warn('Failed to load website settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const openLeadModal = (studio = 'Gurugram HQ') => {
    setLeadModalStudio(studio);
    setIsLeadModalOpen(true);
  };

  const closeLeadModal = () => {
    setIsLeadModalOpen(false);
  };

  const whatsappNumber = settings.whatsapp_number || '+91 97110 22075';
  const whatsappLink = getWhatsAppLink(whatsappNumber);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        whatsappNumber,
        whatsappLink,
        refreshSettings: fetchSettings,
        loading,
        isLeadModalOpen,
        leadModalStudio,
        openLeadModal,
        closeLeadModal,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
export default SettingsContext;
