import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface PlanItem { id?: string; taskId?: string | null; title: string; startTime: string; endTime: string; bufferMinutes: number; energyLevel: string; itemType: string; status?: string; notes?: string; itemOrder: number; }
export interface DailyPlan { id: string; planDate: string; version: number; status: 'DRAFT'|'APPROVED'|'SUPERSEDED'|'COMPLETED'; windowStart: string; windowEnd: string; source: string; assumptions: string[]; summary?: string; items: PlanItem[]; }
const key = (date: string) => ['plans', date];
export type PlanDraft = Omit<DailyPlan,'id'|'version'|'status'>;
export function usePlans(date: string) { return useQuery({ queryKey: key(date), queryFn: async () => (await api.get<DailyPlan[]>('/api/plans', { params: { date } })).data }); }
export function useCreatePlan() { const qc=useQueryClient(); return useMutation({ mutationFn:(body: PlanDraft)=>api.post<DailyPlan>('/api/plans',body), onSuccess:(_d,v)=>qc.invalidateQueries({queryKey:key(v.planDate)}) }); }
export function useApprovePlan() { const qc=useQueryClient(); return useMutation({ mutationFn:(id:string)=>api.post(`/api/plans/${id}/approve`), onSuccess:()=>qc.invalidateQueries({queryKey:['plans']}) }); }
export function useReplan() { const qc=useQueryClient(); return useMutation({ mutationFn:({id,...body}:PlanDraft & {id:string})=>api.post<DailyPlan>(`/api/plans/${id}/replan`,body), onSuccess:(_d,v)=>qc.invalidateQueries({queryKey:key(v.planDate)}) }); }
export function useLogEnergy() { return useMutation({ mutationFn:(body:{energy:number;mood?:number;source?:string;notes?:string})=>api.post('/api/plans/energy',body) }); }
