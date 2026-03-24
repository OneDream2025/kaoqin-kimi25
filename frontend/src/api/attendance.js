import request from '@/utils/request'

export const getTodayAttendance = () => {
  return request.get('/attendance/today')
}

export const checkIn = (data) => {
  return request.post('/attendance/checkin', data)
}

export const getAttendanceHistory = (params) => {
  return request.get('/attendance/history', { params })
}
