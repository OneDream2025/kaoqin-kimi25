<template>
  <div class="dashboard">
    <h2 class="page-title">欢迎使用考勤管理系统</h2>
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon icon-clock">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">今日签到状态</p>
              <p class="stat-value">{{ todayStatus }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon icon-calendar">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">本月签到天数</p>
              <p class="stat-value">{{ monthCount }} 天</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon icon-user">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">当前用户</p>
              <p class="stat-value">{{ currentUser }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-card class="welcome-card">
      <p>当前功能模块：</p>
      <ul>
        <li>✅ 用户登录认证</li>
        <li>✅ 用户管理（增删改查）</li>
        <li>✅ 打卡签到功能</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Timer, Calendar, User } from '@element-plus/icons-vue'
import request from '../utils/request'

const currentUser = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.name || user.username
})

const userId = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.userId
})

const todayStatus = ref('未签到')
const monthCount = ref(0)

const getTodayStatus = async () => {
  try {
    const res = await request.get('/attendance/today', {
      params: { userId: userId.value }
    })
    if (res.data) {
      if (res.data.clockOutTime) {
        todayStatus.value = '已签退'
      } else if (res.data.clockInTime) {
        todayStatus.value = '已签到'
      }
    }
  } catch (error) {
    console.error('获取今日状态失败:', error)
  }
}

const getMonthCount = async () => {
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  try {
    const res = await request.get(`/attendance/user/${userId.value}/date-range`, {
      params: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }
    })
    monthCount.value = res.data?.length || 0
  } catch (error) {
    console.error('获取月统计失败:', error)
  }
}

onMounted(() => {
  getTodayStatus()
  getMonthCount()
})
</script>

<style scoped>
.dashboard {
  padding: 10px;
}

.page-title {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 28px;
  color: white;
}

.icon-clock {
  background: linear-gradient(135deg, #409eff, #66b1ff);
}

.icon-calendar {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.icon-user {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
}

.stat-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-value {
  color: #303133;
  font-size: 28px;
  font-weight: bold;
}

.welcome-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.welcome-card p {
  color: #606266;
  margin-bottom: 10px;
  font-size: 16px;
}

.welcome-card ul {
  padding-left: 20px;
}

.welcome-card li {
  color: #606266;
  margin-bottom: 5px;
}
</style>
