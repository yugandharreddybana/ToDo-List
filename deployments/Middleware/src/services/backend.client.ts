import axios from 'axios';

const BACKEND_URL = (process.env.BACKEND_URL ?? 'http://localhost:8080') + '/api';

export const backendClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

export function backendAuthed(accessToken: string) {
  return axios.create({
    baseURL: BACKEND_URL,
    timeout: 15_000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
