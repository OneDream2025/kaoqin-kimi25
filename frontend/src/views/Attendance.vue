<template>
  <div class="attendance">
    <h2 class="page-title">打卡签到</h2>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="clock-card">
          <div class="clock-section">
            <div class="current-time">{{ currentTime }}</div>
            <div class="current-date">{{ currentDate }}</div>
          </div>

          <div class="status-section">
            <el-tag :type="todayStatus === '未签到' ? 'info' : todayStatus === '已签到' ? 'warning' : 'success'" size="large">
              今日状态: {{ todayStatus }}
            </el-tag>
          </div>

          <div class="button-section">
            <el-button
              type="primary"
              size="large"
              :disabled="clockedIn || loading"
              :loading="loading && actionType === 'in'"
              @click="handleClockIn"
              class="clock-btn"
            >
              <el-icon><Clock /></el-icon>
              上班签到
            </el-button>

            <el-button
              type="success"
              size="large"
              :disabled="!clockedIn || loading"
              :loading="loading && actionType === 'out'"
              @click="handleClockOut"
              class="clock-btn"
            >
              <el-icon><Clock /></el-icon>
              下班签退
            </el-button>
          </div>

          <div class="record-section" v-if="todayRecord">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="签到时间">
                {{ formatTime(todayRecord.clockInTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="签退时间">
                {{ todayRecord.clockOutTime ? formatTime(todayRecord.clockOutTime) : '未签退' }}
              </el-descriptions-item>
              <el-descriptions-item label="打卡方式">
                {{ todayRecord.clockInType === 'BUTTON' ? '按钮打卡' : todayRecord.clockInType }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusType(todayRecord.status)" size="small">
                  {{ getStatusText(todayRecord.status) }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="history-card">
          <template #header>
            <div class="card-header">
              <span>最近打卡记录</span>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="small"
                @change="fetchHistory"
              />
            </div>
          </template>

          <el-table :data="historyList" stripe style="width: 100%" max-height="400" v-loading="historyLoading">
            <el-table-column prop="clockInTime" label="签到时间" width="160">
              <template #default="scope">
                {{ formatTime(scope.row.clockInTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="clockOutTime" label="签退时间" width="160">
              <template #default="scope">
                {{ scope.row.clockOutTime ? formatTime(scope.row.clockOutTime) : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="clockInType" label="打卡方式">
              <template #default="scope">
                {{ scope.row.clockInType === 'BUTTON' ? '按钮打卡' : scope.row.clockInType }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Clock } from '@element-plus/icons-vue'
import request from '../utils/request'

const currentTime = ref('')
const currentDate = ref('')
const todayStatus = ref('未签到')
const clockedIn = ref(false)
const todayRecord = ref(null)
const historyList = ref([])
const loading = ref(false)
const historyLoading = ref(false)
const actionType = ref('')
const dateRange = ref(null)

let timer = null

const userId = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.userId
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

const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleString('zh-CN', { hour12: false })
}

const getStatusType = (status) => {
  const types = {
    'PENDING': 'info',
    'CLOCKED_IN': 'warning',
    'CLOCKED_OUT': 'success',
    'ABSENT': 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'PENDING': '待打卡',
    'CLOCKED_IN': '已签到',
    'CLOCKED_OUT': '已签退',
    'ABSENT': '缺勤'
  }
  return texts[status] || status
}

const fetchTodayStatus = async () => {
  try {
    const res = await request.get('/attendance/today', {
      params: { userId: userId.value }
    })
    if (res.data) {
      todayRecord.value = res.data
      clockedIn.value = !!res.data.clockInTime
      if (res.data.clockOutTime) {
        todayStatus.value = '已签退'
      } else if (res.data.clockInTime) {
        todayStatus.value = '已签到'
      }
    } else {
      todayRecord.value = null
      clockedIn.value = false
      todayStatus.value = '未签到'
    }
  } catch (error) {
    console.error('获取今日状态失败:', error)
  }
}

const fetchHistory = async () => {
  historyLoading.value = true
  try {
    let params = { userId: userId.value }
    let url = `/attendance/user/${userId.value}`

    if (dateRange.value && dateRange.value.length === 2) {
      const startDate = new Date(dateRange.value[0]).toISOString().split('T')[0]
      const endDate = new Date(dateRange.value[1]).toISOString().split('T')[0]
      url = `/attendance/user/${userId.value}/date-range`
      params = { startDate, endDate }
    }

    const res = await request.get(url, { params })
    historyList.value = res.data || []
  } catch (error) {
    console.error('获取历史记录失败:', error)
  } finally {
    historyLoading.value = false
  }
}

const handleClockIn = async () => {
  loading.value = true
  actionType.value = 'in'
  try {
    const res = await request.post('/attendance/clock-in', null, {
      params: { userId: userId.value, clockInType: 'BUTTON' }
    })
    ElMessage.success('签到成功！')
    todayRecord.value = res.data
    clockedIn.value = true
    todayStatus.value = '已签到'
    fetchHistory()
  } catch (error) {
    console.error('签到失败:', error)
  } finally {
    loading.value = false
    actionType.value = ''
  }
}

const handleClockOut = async () => {
  loading.value = true
  actionType.value = 'out'
  try {
    const res = await request.post('/attendance/clock-out', null, {
      params: { userId: userId.value }
    })
    ElMessage.success('签退成功！')
    todayRecord.value = res.data
    todayStatus.value = '已签退'
    fetchHistory()
  } catch (error) {
    console.error('签退失败:', error)
  } finally {
    loading.value = false
    actionType.value = ''
  }
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  fetchTodayStatus()
  fetchHistory()
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

.clock-card {
  border-radius: 8px;
}

.clock-section {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.current-time {
  font-size: 48px;
  font-weight: bold;
  color: #409eff;
  font-family: 'Courier New', monospace;
}

.current-date {
  font-size: 16px;
  color: #666;
  margin-top: 8px;
}

.status-section {
  text-align: center;
  padding: 20px 0;
}

.button-section {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
}

.clock-btn {
  width: 140px;
  height: 50px;
  font-size: 16px;
}

.record-section {
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.history-card {
  border-radius: 8px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
