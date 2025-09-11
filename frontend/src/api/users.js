import axios from './axios';

export const getAllStudents = async () => {
  return axios.get('/users?role=student');
};