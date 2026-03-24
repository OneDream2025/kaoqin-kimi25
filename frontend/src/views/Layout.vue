<template>
  <el-container class="layout-container">
    <el-header class="layout-header">
      <div class="header-left">
        <span class="logo">考勤管理系统</span>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-icon style="margin-right: 5px;"><User /></el-icon>
            {{ user?.name || user?.username }}
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px" class="layout-aside">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          router
          @select="handleMenuSelect"
        >
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/attendance">
            <el-icon><Calendar /></el-icon>
            <span>打卡签到</span>
          </el-menu-item>
          <el-menu-item index="/users" v-if="isAdmin">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { House, Calendar, User } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const user = computed(() => {
  return JSON.parse(localStorage.getItem('user') || '{}')
})

const isAdmin = computed(() => {
  // 兼容 roles 或 role 字段
  const roleStr = String(user.value.roles || user.value.role || '')
  return roleStr.includes('ADMIN')
})

const activeMenu = ref('/dashboard')

const handleMenuSelect = (index) => {
  activeMenu.value = index
}

const handleCommand = (command) => {
  if (command === 'logout') {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    ElMessage.success('退出成功')
    router.push('/login')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-header {
  background: linear-gradient(90deg, #409eff, #667eea);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  color: white;
}

.logo {
  font-size: 20px;
  font-weight: bold;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.layout-aside {
  background-color: #2f3542;
}

.sidebar-menu {
  border: none;
}

.sidebar-menu .el-menu-item {
  color: #aeb2b8;
}

.sidebar-menu .el-menu-item:hover,
.sidebar-menu .el-menu-item.is-active {
  color: #409eff;
  background-color: #262b35 !important;
}

.layout-main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
