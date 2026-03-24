import request from '@/utils/request'

export const getUserList = (params) => {
  return request.get('/users', { params })
}

export const getUserById = (id) => {
  return request.get(`/users/${id}`)
}

export const createUser = (data) => {
  return request.post('/users', data)
}

export const updateUser = (id, data) => {
  return request.put(`/users/${id}`, data)
}

export const deleteUser = (id) => {
  return request.delete(`/users/${id}`)
}

export const updateUserStatus = (id, status) => {
  return request.put(`/users/${id}/status`, null, { params: { status } })
}

export const changePassword = (id, oldPassword, newPassword) => {
  return request.put(`/users/${id}/password`, null, {
    params: { oldPassword, newPassword }
  })
}
