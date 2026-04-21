import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export type CareerStage =
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface CareerApplication {
  id: string;
  company: string;
  role: string;
  stage: CareerStage;
  appliedDate: string;
  notes?: string;
  salary?: number;
  url?: string;
  location?: string;
  remote: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CareerContact {
  id: string;
  name: string;
  company?: string;
  role?: string;
  email?: string;
  linkedinUrl?: string;
  notes?: string;
  createdAt: string;
}

const APPS_KEY = 'career-applications';
const CONTACTS_KEY = 'career-contacts';

export function useApplications(params?: { stage?: CareerStage; search?: string }) {
  return useQuery({
    queryKey: [APPS_KEY, params],
    queryFn: async () => {
      const { data } = await api.get<CareerApplication[]>('/career/applications', { params });
      return data;
    },
  });
}

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<CareerApplication>) => {
      const { data } = await api.post<CareerApplication>('/career/applications', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [APPS_KEY] }),
  });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<CareerApplication> & { id: string }) => {
      const { data } = await api.put<CareerApplication>(`/career/applications/${id}`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [APPS_KEY] }),
  });
}

export function useDeleteApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/career/applications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [APPS_KEY] }),
  });
}

export function useContacts() {
  return useQuery({
    queryKey: [CONTACTS_KEY],
    queryFn: async () => {
      const { data } = await api.get<CareerContact[]>('/career/contacts');
      return data;
    },
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<CareerContact>) => {
      const { data } = await api.post<CareerContact>('/career/contacts', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [CONTACTS_KEY] }),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<CareerContact> & { id: string }) => {
      const { data } = await api.put<CareerContact>(`/career/contacts/${id}`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [CONTACTS_KEY] }),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/career/contacts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CONTACTS_KEY] }),
  });
}
