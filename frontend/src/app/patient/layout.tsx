"use client";

import PatientDashboardLayout from '@/components/layout/PatientDashboardLayout';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PatientDashboardLayout>{children}</PatientDashboardLayout>;
}
