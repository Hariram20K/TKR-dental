import React from 'react';
import { PatientPortalApp } from '../portal/PatientPortalApp';
import { useDentalStore } from '../context/DentalStoreContext';

export const PatientPortalScreen: React.FC = () => {
  const { setRole } = useDentalStore();
  return <PatientPortalApp onSwitchToStaff={() => setRole('dentist')} />;
};
