<template>
  <div class="login-bg">
    <div class="login-box">
      <h2>考勤管理系统</h2>
      <div class="form-group">
        <label>用户名</label>
        <input type="text" v-model="username" placeholder="请输入用户名">
      </div>
      <div class="form-group">
        <label>密码</label>
        <input type="password" v-model="password" placeholder="请输入密码">
      </div>
      <button @click="handleLogin" :disabled="loading">
        {{ loading ? '登录中...' : '登 录'}}
      </button>
      <p class="tip">默认账号: admin / admin123</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  
  try {
    loading.value = true
    const res = await request.post('/auth/login', {
      username: username.value,
      password: password.value
    })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data))
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-bg {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  width: 360px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.login-box h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  height: 40px;
  padding: 0 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #409eff;
}

.login-box button {
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, #409eff, #667eea);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-box button:hover {
  opacity: 0.9;
}

.login-box button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tip {
  margin-top: 20px;
  text-align: center;
  color: #909399;
  font-size: 12px;
}
</style>
