<template>
  <div class="attendance">
    <h2 class="page-title">打卡签到</h2>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="clock-card">
          <div class="clock-display">
            <div class="current-time">{{ currentTime }}</div>
            <div class="current-date">{{ currentDate }}</div>
          </div>
          <div class="clock-buttons">
            <el-button
              type="primary"
              size="large"
              class="clock-btn clock-in-btn"
              @click="handleClockIn"
              :loading="clockInLoading"
              :disabled="isClockedIn"
            >
              签到
            </el-button>
            <el-button
              type="success"
              size="large"
              class="clock-btn clock-out-btn"
              @click="handleClockOut"
              :loading="clockOutLoading"
              :disabled="!isClockedIn || isClockedOut"
            >
              签退
            </el-button>
          </div>
          <div class="clock-status">
            <el-alert
              :title="statusMessage"
              :type="statusType"
              :closable="false"
              show-icon
            />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="records-card">
          <template #header>
            <div class="card-header">
              <span>今日打卡记录</span>
            </div>
          </template>
          <div v-if="todayRecord" class="today-record">
            <p>
              <span class="label">签到时间：</span>
              <span class="value">{{ formatTime(todayRecord.clockInTime) }}</span>
            </p>
            <p>
              <span class="label">签到方式：</span>
              <span class="value">{{ todayRecord.clockInType }}</span>
            </p>
            <p v-if="todayRecord.clockOutTime">
              <span class="label">签退时间：</span>
              <span class="value">{{ formatTime(todayRecord.clockOutTime) }}</span>
            </p>
            <p>
              <span class="label">状态：</span>
              <el-tag :type="getTagType(todayRecord.status)">{{ getStatusText(todayRecord.status) }}</el-tag>
            </p>
          </div>
          <div v-else class="no-record">
            <el-empty description="今日暂无打卡记录" :image-size="100" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-card class="history-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>最近打卡记录</span>
        </div>
      </template>
      <el-table :data="recentRecords" stripe>
        <el-table-column prop="clockInTime" label="签到时间" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.clockInTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="clockOutTime" label="签退时间" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.clockOutTime) || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="clockInType" label="签到方式" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '../utils/request'

const currentTime = ref('')
const currentDate = ref('')
const clockInLoading = ref(false)
const clockOutLoading = ref(false)
const todayRecord = ref(null)
const recentRecords = ref([])

const userId = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.id || user.userId
})

const isClockedIn = computed(() => {
  return todayRecord.value && todayRecord.value.clockInTime
})

const isClockedOut = computed(() => {
  return todayRecord.value && todayRecord.value.clockOutTime
})

const statusMessage = computed(() => {
  if (isClockedOut.value) {
    return '今日已完成签到签退'
  } else if (isClockedIn.value) {
    return '已签到，工作中...'
  } else {
    return '请开始今日签到'
  }
})

const statusType = computed(() => {
  if (isClockedOut.value) {
    return 'success'
  } else if (isClockedIn.value) {
    return 'warning'
  } else {
    return 'info'
  }
})

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

const getTodayRecord = async () => {
  try {
    const res = await request.get('/attendance/today', {
      params: { userId: userId.value }
    })
    todayRecord.value = res.data
  } catch (error) {
    console.error('获取今日记录失败:', error)
  }
}

const getRecentRecords = async () => {
  try {
    const res = await request.get(`/attendance/user/${userId.value}`)
    recentRecords.value = (res.data || []).slice(0, 10)
  } catch (error) {
    console.error('获取历史记录失败:', error)
  }
}

const handleClockIn = async () => {
  try {
    clockInLoading.value = true
    await request.post('/attendance/clock-in', null, {
      params: { userId: userId.value, clockInType: 'BUTTON' }
    })
    await getTodayRecord()
    await getRecentRecords()
  } catch (error) {
    console.error('签到失败:', error)
  } finally {
    clockInLoading.value = false
  }
}

const handleClockOut = async () => {
  try {
    clockOutLoading.value = true
    await request.post('/attendance/clock-out', null, {
      params: { userId: userId.value }
    })
    await getTodayRecord()
    await getRecentRecords()
  } catch (error) {
    console.error('签退失败:', error)
  } finally {
    clockOutLoading.value = false
  }
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return new Date(timeStr).toLocaleString('zh-CN')
}

const getStatusText = (status) => {
  const statusMap = {
    'CLOCKED_IN': '已签到',
    'CLOCKED_OUT': '已签退',
    'ABSENT': '缺勤',
    'PENDING': '待签到'
  }
  return statusMap[status] || status
}

const getTagType = (status) => {
  const typeMap = {
    'CLOCKED_IN': 'warning',
    'CLOCKED_OUT': 'success',
    'ABSENT': 'danger',
    'PENDING': 'info'
  }
  return typeMap[status] || 'info'
}

let timer = null

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  getTodayRecord()
  getRecentRecords()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.attendance {
  padding: 10px;
}

.page-title {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

.clock-card,
.records-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.clock-display {
  text-align: center;
  padding: 30px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  margin-bottom: 20px;
}

.current-time {
  font-size: 48px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.current-date {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 10px;
}

.clock-buttons {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.clock-btn {
  width: 120px;
  height: 50px;
  font-size: 18px;
}

.clock-in-btn {
  background: linear-gradient(135deg, #409eff, #66b1ff);
  border: none;
}

.clock-out-btn {
  background: linear-gradient(135deg, #67c23a, #85ce61);
  border: none;
}

.today-record {
  padding: 10px 0;
}

.today-record p {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.today-record .label {
  color: #909399;
  width: 80px;
}

.today-record .value {
  color: #303133;
  font-weight: 500;
}

.no-record {
  padding: 20px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
