import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/checkin',
    children: [
      {
        path: 'checkin',
        name: 'CheckIn',
        component: () => import('@/views/CheckIn.vue'),
        meta: { title: '打卡签到', icon: 'Clock' }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/UserManagement.vue'),
        meta: { title: '用户管理', icon: 'User', admin: true }
      },
      {
        path: 'leave',
        name: 'Leave',
        component: () => import('@/views/Leave.vue'),
        meta: { title: '请假申请', icon: 'Calendar' }
      },
      {
        path: 'history',
        name: 'History',
        component: () => import('@/views/History.vue'),
        meta: { title: '打卡记录', icon: 'Timer' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (!to.meta.public && !userStore.token) {
    next('/login')
    return
  }

  if (to.meta.admin && userStore.userInfo?.role !== 'ADMIN') {
    next('/')
    return
  }

  next()
})

export default router
