import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getCurrentUser } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === 'ADMIN')

  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUserInfo = (info) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const loginAction = async (credentials) => {
    const res = await login(credentials)
    const responseData = res.data || {}
    const { token: newToken, user } = responseData
    if (newToken && user) {
      setToken(newToken)
      setUserInfo(user)
    } else {
      throw new Error('登录响应数据格式错误')
    }
    return res
  }

  const fetchUserInfo = async () => {
    const res = await getCurrentUser()
    setUserInfo(res.data)
    return res
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    setToken,
    setUserInfo,
    loginAction,
    fetchUserInfo,
    logout
  }
})
