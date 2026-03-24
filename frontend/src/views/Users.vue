<template>
  <div class="users">
    <h2 class="page-title">用户管理</h2>
    <el-card class="users-card">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
      </template>
      <el-table :data="users" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'ADMIN' ? 'danger' : 'primary'" size="small">
              {{ scope.row.role === 'ADMIN' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="userForm"
        :model="userForm"
        :rules="formRules"
        label-width="80px"
        class="user-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" style="width: 100%">
            <el-option label="普通用户" value="USER" />
            <el-option label="管理员" value="ADMIN" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      title="确认删除"
      v-model="deleteDialogVisible"
      width="400px"
    >
      <p>确定要删除用户「{{ deleteUser?.name || deleteUser?.username }}」吗？</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取 消</el-button>
          <el-button type="danger" @click="confirmDelete" :loading="deleteLoading">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import request from '../utils/request'

const loading = ref(false)
const submitLoading = ref(false)
const deleteLoading = ref(false)
const users = ref([])
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const isEdit = ref(false)
const deleteUser = ref(null)

const dialogTitle = computed(() => isEdit.value ? '编辑用户' : '新增用户')

const userForm = reactive({
  id: null,
  username: '',
  password: '',
  name: '',
  phone: '',
  email: '',
  role: 'USER'
})

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const getUsers = async () => {
  loading.value = true
  try {
    const res = await request.get('/users')
    users.value = res.data || []
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(userForm, { ...row, password: '' })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    submitLoading.value = true
    if (isEdit.value) {
      await request.put(`/users/${userForm.id}`, userForm)
      ElMessage.success('编辑成功')
    } else {
      await request.post('/users', userForm)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getUsers()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = (row) => {
  deleteUser.value = row
  deleteDialogVisible.value = true
}

const confirmDelete = async () => {
  try {
    deleteLoading.value = true
    await request.delete(`/users/${deleteUser.value.id}`)
    ElMessage.success('删除成功')
    deleteDialogVisible.value = false
    getUsers()
  } catch (error) {
    console.error('删除失败:', error)
  } finally {
    deleteLoading.value = false
  }
}

const resetForm = () => {
  Object.assign(userForm, {
    id: null,
    username: '',
    password: '',
    name: '',
    phone: '',
    email: '',
    role: 'USER'
  })
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return new Date(timeStr).toLocaleString('zh-CN')
}

onMounted(() => {
  getUsers()
})
</script>

<style scoped>
.users {
  padding: 10px;
}

.page-title {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

.users-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-form {
  padding-top: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
