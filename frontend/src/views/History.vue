<template>
  <div class="history-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>打卡记录</span>
        </div>
      </template>

      <!-- 筛选栏 -->
      <el-form :model="queryForm" inline class="search-form">
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="queryForm.startDate"
            type="date"
            placeholder="选择开始日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker
            v-model="queryForm.endDate"
            type="date"
            placeholder="选择结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshRight /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="historyList" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="date" label="日期" min-width="120">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="checkInTime" label="上班时间" min-width="160">
          <template #default="{ row }">
            <el-tag v-if="row.checkInTime" type="success">
              {{ formatDateTime(row.checkInTime) }}
            </el-tag>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="checkOutTime" label="下班时间" min-width="160">
          <template #default="{ row }">
            <el-tag v-if="row.checkOutTime" type="info">
              {{ formatDateTime(row.checkOutTime) }}
            </el-tag>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="workDuration" label="工作时长" min-width="120">
          <template #default="{ row }">
            {{ row.workDuration || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checkInLocation" label="打卡地点" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.checkInLocation || '--' }}
          </template>
        </el-table-column>
      </el-table>

      <div v-if="historyList.length === 0 && !loading" class="empty-tip">
        <el-empty description="暂无打卡记录" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getAttendanceHistory } from '@/api/attendance'

const loading = ref(false)
const historyList = ref([])

const queryForm = reactive({
  startDate: '',
  endDate: ''
})

const formatDate = (date) => {
  if (!date) return '--'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatDateTime = (datetime) => {
  if (!datetime) return '--'
  return new Date(datetime).toLocaleString('zh-CN')
}

const getStatusType = (status) => {
  const typeMap = {
    'NORMAL': 'success',
    'LATE': 'warning',
    'SERIOUS_LATE': 'danger',
    'EARLY_LEAVE': 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'NORMAL': '正常',
    'LATE': '迟到',
    'SERIOUS_LATE': '严重迟到',
    'EARLY_LEAVE': '早退'
  }
  return textMap[status] || status
}

const fetchHistory = async () => {
  loading.value = true
  try {
    const params = {}
    if (queryForm.startDate) params.startDate = queryForm.startDate
    if (queryForm.endDate) params.endDate = queryForm.endDate
    const res = await getAttendanceHistory(params)
    historyList.value = res.data
  } catch (error) {
    console.error('获取打卡记录失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  fetchHistory()
}

const handleReset = () => {
  queryForm.startDate = ''
  queryForm.endDate = ''
  fetchHistory()
}

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped>
.history-page {
  padding: 0;
}

.card-header {
  font-weight: bold;
}

.search-form {
  margin-bottom: 20px;
}

.empty-tip {
  padding: 40px 0;
}
</style>
