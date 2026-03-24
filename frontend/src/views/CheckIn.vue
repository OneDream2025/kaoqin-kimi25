<template>
  <div class="checkin-page">
    <!-- 今日考勤状态卡片 -->
    <el-card class="status-card">
      <template #header>
        <div class="card-header">
          <span>今日考勤状态</span>
          <el-tag :type="statusType">{{ todayStatus.status }}</el-tag>
        </div>
      </template>

      <div class="time-display">
        <div class="time-item">
          <label>上班时间</label>
          <div class="time-value">{{ formatTime(todayStatus.checkInTime) || '--:--' }}</div>
        </div>
        <div class="time-divider"></div>
        <div class="time-item">
          <label>下班时间</label>
          <div class="time-value">{{ formatTime(todayStatus.checkOutTime) || '--:--' }}</div>
        </div>
        <div class="time-divider"></div>
        <div class="time-item">
          <label>工作时长</label>
          <div class="time-value">{{ todayStatus.workDuration || '--' }}</div>
        </div>
      </div>
    </el-card>

    <!-- 打卡按钮区域 -->
    <el-card class="checkin-card">
      <template #header>
        <div class="card-header">
          <span>打卡操作</span>
        </div>
      </template>

      <div class="checkin-buttons">
        <div class="checkin-btn-wrapper">
          <el-button
            type="primary"
            size="large"
            class="checkin-btn checkin"
            :disabled="!todayStatus.canCheckIn"
            :loading="checkingIn"
            @click="handleCheckIn"
          >
            <el-icon size="32"><CircleCheck /></el-icon>
            <span class="btn-text">上班打卡</span>
            <span class="btn-time">{{ currentTime }}</span>
          </el-button>
          <p v-if="!todayStatus.canCheckIn" class="btn-desc">今日已完成上班打卡</p>
        </div>

        <div class="checkin-btn-wrapper">
          <el-button
            type="success"
            size="large"
            class="checkin-btn checkout"
            :disabled="!todayStatus.canCheckOut"
            :loading="checkingOut"
            @click="handleCheckOut"
          >
            <el-icon size="32"><CircleClose /></el-icon>
            <span class="btn-text">下班打卡</span>
            <span class="btn-time">{{ currentTime }}</span>
          </el-button>
          <p v-if="!todayStatus.canCheckOut" class="btn-desc">
            {{ todayStatus.checkOutTime ? '今日已完成下班打卡' : '请先完成上班打卡' }}
          </p>
        </div>
      </div>
    </el-card>

    <!-- 打卡提示 -->
    <el-card class="tips-card">
      <template #header>
        <div class="card-header">
          <span>打卡说明</span>
        </div>
      </template>
      <ul class="tips-list">
        <li>上班打卡时间：09:00 前为正常，09:00-10:00 为迟到，10:00 后为严重迟到</li>
        <li>下班打卡：完成上班打卡后才可进行下班打卡</li>
        <li>每日只能打卡一次上班和一次下班</li>
        <li>打卡记录可在"打卡记录"页面查看</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getTodayAttendance, checkIn } from '@/api/attendance'

const todayStatus = ref({
  status: '未打卡',
  checkInTime: null,
  checkOutTime: null,
  workDuration: null,
  canCheckIn: true,
  canCheckOut: false
})

const checkingIn = ref(false)
const checkingOut = ref(false)
const currentTime = ref('')
let timer = null

const statusType = computed(() => {
  switch (todayStatus.value.status) {
    case '已下班':
      return 'success'
    case '已上班':
      return 'warning'
    default:
      return 'info'
  }
})

const formatTime = (datetime) => {
  if (!datetime) return null
  const date = new Date(datetime)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const fetchTodayStatus = async () => {
  try {
    const res = await getTodayAttendance()
    todayStatus.value = res.data
  } catch (error) {
    console.error('获取今日考勤状态失败:', error)
  }
}

const handleCheckIn = async () => {
  checkingIn.value = true
  try {
    await checkIn({
      type: 'CHECK_IN',
      location: '办公室'
    })
    ElMessage.success('上班打卡成功')
    await fetchTodayStatus()
  } catch (error) {
    console.error('上班打卡失败:', error)
  } finally {
    checkingIn.value = false
  }
}

const handleCheckOut = async () => {
  checkingOut.value = true
  try {
    await checkIn({
      type: 'CHECK_OUT',
      location: '办公室'
    })
    ElMessage.success('下班打卡成功')
    await fetchTodayStatus()
  } catch (error) {
    console.error('下班打卡失败:', error)
  } finally {
    checkingOut.value = false
  }
}

onMounted(() => {
  fetchTodayStatus()
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.checkin-page {
  max-width: 800px;
  margin: 0 auto;
}

.status-card,
.checkin-card,
.tips-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.time-display {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20px 0;
}

.time-item {
  text-align: center;
  flex: 1;
}

.time-item label {
  display: block;
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.time-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.time-divider {
  width: 1px;
  height: 50px;
  background-color: #e4e7ed;
}

.checkin-buttons {
  display: flex;
  justify-content: center;
  gap: 60px;
  padding: 40px 0;
}

.checkin-btn-wrapper {
  text-align: center;
}

.checkin-btn {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
}

.checkin-btn.checkin {
  background: linear-gradient(135deg, #409eff, #66b1ff);
}

.checkin-btn.checkout {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.checkin-btn:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
}

.btn-text {
  font-size: 18px;
  font-weight: bold;
}

.btn-time {
  font-size: 14px;
  opacity: 0.9;
}

.btn-desc {
  margin-top: 15px;
  color: #909399;
  font-size: 14px;
}

.tips-list {
  padding-left: 20px;
  color: #606266;
  line-height: 2;
}

.tips-list li {
  margin-bottom: 5px;
}
</style>
