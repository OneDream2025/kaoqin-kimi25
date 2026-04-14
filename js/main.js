// 全局变量
let currentCheckinStatus = 'out';
let checkinTime = null;
let checkoutTime = null;
let currentUser = null;
let editingUserId = null;
let deletingUserId = null;

const DEFAULT_USERS = [
    { id: 1, name: '张三', username: 'zhangsan', email: 'zhangsan@example.com', password: '123456', department: '技术部', position: '工程师', phone: '13800138001', role: 'user', status: 'active', createdAt: '2024-01-15' },
    { id: 2, name: '李四', username: 'lisi', email: 'lisi@example.com', password: '123456', department: '产品部', position: '产品经理', phone: '13800138002', role: 'user', status: 'active', createdAt: '2024-01-20' },
    { id: 3, name: '王五', username: 'wangwu', email: 'wangwu@example.com', password: '123456', department: '运营部', position: '运营专员', phone: '13800138003', role: 'user', status: 'active', createdAt: '2024-02-01' },
    { id: 4, name: '赵六', username: 'zhaoliu', email: 'zhaoliu@example.com', password: '123456', department: '市场部', position: '市场专员', phone: '13800138004', role: 'user', status: 'active', createdAt: '2024-02-10' },
    { id: 5, name: '孙七', username: 'sunqi', email: 'sunqi@example.com', password: '123456', department: '人事部', position: '人事专员', phone: '13800138005', role: 'user', status: 'active', createdAt: '2024-02-15' },
    { id: 6, name: '周八', username: 'zhouba', email: 'zhouba@example.com', password: '123456', department: '财务部', position: '会计', phone: '13800138006', role: 'user', status: 'active', createdAt: '2024-02-20' },
    { id: 7, name: '吴九', username: 'wujiu', email: 'wujiu@example.com', password: '123456', department: '技术部', position: '高级工程师', phone: '13800138007', role: 'user', status: 'active', createdAt: '2024-03-01' },
    { id: 8, name: '管理员', username: 'admin', email: 'admin@example.com', password: 'admin123', department: '人事部', position: '主管', phone: '13800138000', role: 'admin', status: 'active', createdAt: '2024-01-01' }
];

function initUsers() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
    }
}

function getUsers() {
    initUsers();
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

document.addEventListener('DOMContentLoaded', function() {
    initUsers();
    initCurrentTime();
    initLocation();
    initEventListeners();
    initDateInputs();
    calculateLeaveDays();
    initAuthPages();
    initUserManagement();
    checkAuthStatus();
});

// 初始化当前时间显示
function initCurrentTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        updateTime();
        setInterval(updateTime, 1000);
    }
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    const element = document.getElementById('currentTime');
    if (element) {
        element.textContent = timeString;
    }
}

// 初始化位置信息
function initLocation() {
    const locationElement = document.getElementById('locationText');
    if (locationElement && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                locationElement.textContent = '公司总部 - 定位成功';
                locationElement.style.color = '#10b981';
            },
            (error) => {
                locationElement.textContent = '公司总部 - 默认位置';
                locationElement.style.color = '#6b7280';
            }
        );
    } else if (locationElement) {
        locationElement.textContent = '公司总部 - 默认位置';
    }
}

// 初始化事件监听器
function initEventListeners() {
    // 打卡方式切换
    const methodBtns = document.querySelectorAll('.method-btn');
    methodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            methodBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 更新打卡按钮图标
            const method = this.dataset.method;
            const checkinBtn = document.getElementById('checkinBtn');
            if (checkinBtn) {
                const icon = checkinBtn.querySelector('i');
                updateCheckinIcon(icon, method);
            }
        });
    });

    // 打卡按钮
    const checkinBtn = document.getElementById('checkinBtn');
    if (checkinBtn) {
        checkinBtn.addEventListener('click', handleCheckin);
    }

    // 请假类型标签切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterLeaveList(this.dataset.filter);
        });
    });

    // 审批类型切换
    const approvalTabs = document.querySelectorAll('.approval-tab');
    approvalTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            approvalTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            switchApprovalType(this.dataset.type);
        });
    });

    // 时间范围选择
    const timeRange = document.getElementById('timeRange');
    if (timeRange) {
        timeRange.addEventListener('change', function() {
            const customDates = document.querySelectorAll('.custom-date');
            if (this.value === 'custom') {
                customDates.forEach(el => el.style.display = 'flex');
            } else {
                customDates.forEach(el => el.style.display = 'none');
            }
        });
    }

    // 请假日期计算
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    if (startDate && endDate) {
        startDate.addEventListener('change', calculateLeaveDays);
        endDate.addEventListener('change', calculateLeaveDays);
    }

    // 文件上传
    const fileInput = document.getElementById('attachment');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const fileName = document.getElementById('fileName');
            if (fileName && this.files.length > 0) {
                fileName.textContent = this.files[0].name;
            }
        });
    }
}

// 更新打卡图标
function updateCheckinIcon(icon, method) {
    icon.className = '';
    switch(method) {
        case 'face':
            icon.className = 'fas fa-user-circle';
            break;
        case 'fingerprint':
            icon.className = 'fas fa-fingerprint';
            break;
        case 'qrcode':
            icon.className = 'fas fa-qrcode';
            break;
        case 'gps':
            icon.className = 'fas fa-map-marker-alt';
            break;
        default:
            icon.className = 'fas fa-fingerprint';
    }
}

// 处理打卡
function handleCheckin() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN', { hour12: false });
    
    if (!checkinTime) {
        // 第一次：上班打卡 - 只能打卡一次
        checkinTime = now;
        currentCheckinStatus = 'in';
        
        document.getElementById('checkInTime').textContent = timeString;
        document.getElementById('todayStatus').textContent = '工作中';
        document.getElementById('todayStatus').className = 'status-badge approved';
        
        const btn = document.getElementById('checkinBtn');
        btn.querySelector('span').textContent = '下班打卡';
        btn.style.background = 'linear-gradient(135deg, #ef4444, #f87171)';
        
        showNotification('上班打卡成功！', 'success');
    } else if (currentCheckinStatus === 'out') {
        // 已打过上班卡，不能再打上班卡
        showNotification('上班已打卡，今天无需重复打卡', 'info');
    } else {
        // 下班打卡 - 支持多次打卡，更新时间
        checkoutTime = now;
        currentCheckinStatus = 'in'; // 保持in状态，允许继续打下班卡更新
        
        document.getElementById('checkOutTime').textContent = timeString;
        document.getElementById('todayStatus').textContent = '已下班';
        document.getElementById('todayStatus').className = 'status-badge approved';
        
        // 计算工作时长
        const duration = calculateDuration(checkinTime, checkoutTime);
        document.getElementById('workDuration').textContent = duration;
        
        const isUpdate = document.getElementById('checkOutTime').textContent !== '--:--' && checkoutTime;
        showNotification('下班打卡成功！' + (isUpdate ? '时间已更新' : ''), 'success');
    }
}

// 计算时长
function calculateDuration(start, end) {
    const diff = end - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}小时${minutes}分`;
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 异常申请弹窗
function showExceptionModal() {
    const modal = document.getElementById('exceptionModal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('exceptionDate').valueAsDate = new Date();
    }
}

function closeExceptionModal() {
    const modal = document.getElementById('exceptionModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function submitException() {
    closeExceptionModal();
    showNotification('异常申请已提交，等待审批', 'success');
}

// 请假申请弹窗
function showLeaveModal() {
    const modal = document.getElementById('leaveModal');
    if (modal) {
        modal.classList.add('active');
        initDateInputs();
    }
}

function closeLeaveModal() {
    const modal = document.getElementById('leaveModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function submitLeave() {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    if (startDate.value && endDate.value) {
        const start = new Date(startDate.value);
        const end = new Date(endDate.value);
        if (end < start) {
            showNotification('结束日期不能小于开始日期', 'error');
            return;
        }
    }
    
    const form = document.getElementById('leaveForm');
    if (form && form.checkValidity()) {
        closeLeaveModal();
        showNotification('请假申请已提交，等待审批', 'success');
    } else {
        form.reportValidity();
    }
}

// 初始化日期输入
function initDateInputs() {
    const today = new Date().toISOString().split('T')[0];
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    if (startDate) startDate.min = today;
    if (endDate) endDate.min = today;
}

// 计算请假天数
function calculateLeaveDays() {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const leaveDays = document.getElementById('leaveDays');
    
    if (startDate && startDate.value) {
        endDate.min = startDate.value;
    }
    
    if (startDate && endDate && leaveDays && startDate.value && endDate.value) {
        const start = new Date(startDate.value);
        const end = new Date(endDate.value);
        
        if (end >= start) {
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            leaveDays.value = diffDays + '天';
        } else {
            leaveDays.value = '';
            showNotification('结束日期不能小于开始日期', 'error');
            endDate.value = '';
        }
    }
}

// 撤销请假
function cancelLeave(btn) {
    if (confirm('确定要撤销这个请假申请吗？')) {
        const item = btn.closest('.leave-item');
        item.style.opacity = '0';
        setTimeout(() => {
            item.remove();
            showNotification('请假申请已撤销', 'success');
        }, 300);
    }
}

// 筛选请假列表
function filterLeaveList(filter) {
    const items = document.querySelectorAll('.leave-item');
    items.forEach(item => {
        if (filter === 'all' || item.dataset.status === filter) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// 请假详情弹窗
function showLeaveDetailModal() {
    const modal = document.getElementById('leaveDetailModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeLeaveDetailModal() {
    const modal = document.getElementById('leaveDetailModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 打卡详情弹窗
function showDetail(date) {
    const modal = document.getElementById('detailModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeDetailModal() {
    const modal = document.getElementById('detailModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 导出数据
function exportData() {
    showNotification('正在导出数据...', 'info');
    setTimeout(() => {
        showNotification('数据导出成功！', 'success');
    }, 1500);
}

// 搜索记录
function searchRecords() {
    showNotification('正在查询...', 'info');
    setTimeout(() => {
        showNotification('查询完成', 'success');
    }, 500);
}

// 日历导航
function prevMonth() {
    showNotification('切换到上月', 'info');
}

function nextMonth() {
    showNotification('切换到下月', 'info');
}

// 切换审批类型
function switchApprovalType(type) {
    document.getElementById('leaveApproval').style.display = 'none';
    document.getElementById('exceptionApproval').style.display = 'none';
    document.getElementById('overtimeApproval').style.display = 'none';
    
    if (type === 'leave') {
        document.getElementById('leaveApproval').style.display = 'block';
    } else if (type === 'exception') {
        document.getElementById('exceptionApproval').style.display = 'block';
    } else if (type === 'overtime') {
        document.getElementById('overtimeApproval').style.display = 'block';
    }
}

// 审批操作
function approveItem(btn) {
    const item = btn.closest('.approval-item');
    item.style.opacity = '0.5';
    setTimeout(() => {
        item.remove();
        showNotification('审批已通过', 'success');
        updateBadgeCount();
    }, 300);
}

function rejectItem(btn) {
    const item = btn.closest('.approval-item');
    item.style.opacity = '0.5';
    setTimeout(() => {
        item.remove();
        showNotification('审批已拒绝', 'success');
        updateBadgeCount();
    }, 300);
}

function batchApprove() {
    const checkedItems = document.querySelectorAll('.item-checkbox:checked');
    if (checkedItems.length === 0) {
        showNotification('请先选择要审批的项', 'error');
        return;
    }
    
    checkedItems.forEach(checkbox => {
        const item = checkbox.closest('.approval-item');
        item.style.opacity = '0.5';
        setTimeout(() => item.remove(), 300);
    });
    
    showNotification(`已批量通过 ${checkedItems.length} 项`, 'success');
    updateBadgeCount();
}

function batchReject() {
    const checkedItems = document.querySelectorAll('.item-checkbox:checked');
    if (checkedItems.length === 0) {
        showNotification('请先选择要审批的项', 'error');
        return;
    }
    
    checkedItems.forEach(checkbox => {
        const item = checkbox.closest('.approval-item');
        item.style.opacity = '0.5';
        setTimeout(() => item.remove(), 300);
    });
    
    showNotification(`已批量拒绝 ${checkedItems.length} 项`, 'success');
    updateBadgeCount();
}

// 更新徽章数量
function updateBadgeCount() {
    const leaveItems = document.querySelectorAll('#leaveApproval .approval-item').length;
    const exceptionItems = document.querySelectorAll('#exceptionApproval .approval-item').length;
    const totalItems = leaveItems + exceptionItems;
    
    // 更新侧边栏徽章
    const badges = document.querySelectorAll('.tab-badge');
    if (badges[0]) badges[0].textContent = leaveItems;
    if (badges[1]) badges[1].textContent = exceptionItems;
    
    // 更新通知铃铛
    const notificationBadge = document.querySelector('.notification-badge');
    if (notificationBadge) {
        notificationBadge.textContent = totalItems;
    }
}

// 审批详情弹窗
function showApprovalDetail(type, id) {
    const modal = document.getElementById('approvalDetailModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeApprovalDetailModal() {
    const modal = document.getElementById('approvalDetailModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function approveWithComment() {
    closeApprovalDetailModal();
    showNotification('审批已通过', 'success');
}

function rejectWithReason() {
    closeApprovalDetailModal();
    showNotification('审批已拒绝', 'success');
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 全选功能
function toggleSelectAll(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const selectAllCheckbox = section.querySelector('.select-all-checkbox');
    const itemCheckboxes = section.querySelectorAll('.item-checkbox');
    
    itemCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

// 监听单个复选框变化，更新全选状态
function initCheckboxListeners() {
    const sections = ['leaveApproval', 'exceptionApproval'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        const itemCheckboxes = section.querySelectorAll('.item-checkbox');
        const selectAllCheckbox = section.querySelector('.select-all-checkbox');
        
        itemCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const allChecked = Array.from(itemCheckboxes).every(cb => cb.checked);
                const someChecked = Array.from(itemCheckboxes).some(cb => cb.checked);
                
                if (allChecked) {
                    selectAllCheckbox.checked = true;
                    selectAllCheckbox.indeterminate = false;
                } else if (someChecked) {
                    selectAllCheckbox.checked = false;
                    selectAllCheckbox.indeterminate = true;
                } else {
                    selectAllCheckbox.checked = false;
                    selectAllCheckbox.indeterminate = false;
                }
            });
        });
    });
}

// 在初始化事件监听器中添加复选框监听
document.addEventListener('DOMContentLoaded', function() {
    initCheckboxListeners();
});

// 点击弹窗外部关闭
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

function initAuthPages() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!username || !password) {
        showNotification('请输入用户名和密码', 'error');
        return;
    }
    
    const users = getUsers();
    const user = users.find(u => 
        (u.username === username || u.email === username) && u.password === password
    );
    
    if (user) {
        if (user.status === 'inactive') {
            showNotification('该账户已离职，无法登录', 'error');
            return;
        }
        
        const { password: _, ...safeUser } = user;
        setCurrentUser(safeUser);
        
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        showNotification('登录成功！', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    } else {
        showNotification('用户名或密码错误', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const department = document.getElementById('regDepartment').value;
    const position = document.getElementById('regPosition').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    if (!name || !username || !email || !password || !department) {
        showNotification('请填写所有必填项', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('密码至少需要6位', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('两次输入的密码不一致', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showNotification('请阅读并同意用户协议', 'error');
        return;
    }
    
    const users = getUsers();
    
    if (users.some(u => u.username === username)) {
        showNotification('用户名已存在', 'error');
        return;
    }
    
    if (users.some(u => u.email === email)) {
        showNotification('邮箱已被注册', 'error');
        return;
    }
    
    const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        name,
        username,
        email,
        password,
        department,
        position: position || '员工',
        phone,
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
    };
    
    users.push(newUser);
    saveUsers(users);
    
    showNotification('注册成功！请登录', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

function handleLogout() {
    setCurrentUser(null);
    localStorage.removeItem('rememberMe');
    showNotification('已退出登录', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 500);
}

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function checkAuthStatus() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const publicPages = ['login.html', 'register.html'];
    const adminPages = ['users.html'];
    
    if (isLoggedIn()) {
        if (publicPages.includes(currentPage)) {
            window.location.href = 'index.html';
            return;
        }
        
        if (adminPages.includes(currentPage) && !isAdmin()) {
            showNotification('您没有权限访问此页面', 'error');
            window.location.href = 'index.html';
            return;
        }
        
        updateUserInfo();
    } else {
        if (!publicPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
    }
}

function updateUserInfo() {
    const user = getCurrentUser();
    if (!user) return;
    
    const userNames = document.querySelectorAll('.user-name');
    const userRoles = document.querySelectorAll('.user-role');
    
    userNames.forEach(el => {
        el.textContent = user.name;
    });
    
    userRoles.forEach(el => {
        el.textContent = `${user.department} - ${user.position || '员工'}`;
    });
    
    const adminMenus = document.querySelectorAll('.admin-only');
    if (user.role === 'admin') {
        adminMenus.forEach(el => {
            el.style.display = 'list-item';
        });
    }
}

function initUserManagement() {
    if (!document.getElementById('userTableBody')) return;
    
    renderUserTable();
    updateStats();
}

function renderUserTable(filteredUsers = null) {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;
    
    const users = filteredUsers || getUsers();
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>
                <div class="user-cell">
                    <div class="user-avatar-small">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-info-cell">
                        <span class="user-name-cell">${user.name}</span>
                        <span class="user-username">@${user.username}</span>
                    </div>
                </div>
            </td>
            <td>${user.department}</td>
            <td>${user.position || '-'}</td>
            <td>${user.email}</td>
            <td>${user.phone || '-'}</td>
            <td>
                <span class="role-tag ${user.role}">${user.role === 'admin' ? '管理员' : '普通用户'}</span>
            </td>
            <td>
                <span class="status-tag ${user.status}">${user.status === 'active' ? '在职' : '离职'}</span>
            </td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon" onclick="editUser(${user.id})" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteUser(${user.id})" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    document.getElementById('userCount').textContent = `共 ${users.length} 条记录`;
}

function updateStats() {
    const users = getUsers();
    
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('activeUsers').textContent = users.filter(u => u.status === 'active').length;
    document.getElementById('inactiveUsers').textContent = users.filter(u => u.status === 'inactive').length;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    document.getElementById('newUsers').textContent = users.filter(u => 
        u.createdAt && u.createdAt.startsWith(currentMonth)
    ).length;
}

function searchUsers() {
    const keyword = document.getElementById('searchUser').value.toLowerCase().trim();
    const users = getUsers();
    
    if (!keyword) {
        filterUsers();
        return;
    }
    
    const filtered = users.filter(user => 
        user.name.toLowerCase().includes(keyword) ||
        user.username.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
    );
    
    renderUserTable(filtered);
}

function filterUsers() {
    const department = document.getElementById('filterDepartment').value;
    const status = document.getElementById('filterStatus').value;
    const role = document.getElementById('filterRole').value;
    const keyword = document.getElementById('searchUser').value.toLowerCase().trim();
    
    let users = getUsers();
    
    if (department) {
        users = users.filter(u => u.department === department);
    }
    
    if (status) {
        users = users.filter(u => u.status === status);
    }
    
    if (role) {
        users = users.filter(u => u.role === role);
    }
    
    if (keyword) {
        users = users.filter(user => 
            user.name.toLowerCase().includes(keyword) ||
            user.username.toLowerCase().includes(keyword) ||
            user.email.toLowerCase().includes(keyword)
        );
    }
    
    renderUserTable(users);
}

function showAddUserModal() {
    editingUserId = null;
    document.getElementById('userModalTitle').textContent = '添加用户';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userPassword').placeholder = '至少6位密码';
    document.getElementById('passwordRequired').style.display = 'inline';
    document.getElementById('userModal').classList.add('active');
}

function editUser(id) {
    const users = getUsers();
    const user = users.find(u => u.id === id);
    
    if (!user) {
        showNotification('用户不存在', 'error');
        return;
    }
    
    editingUserId = id;
    document.getElementById('userModalTitle').textContent = '编辑用户';
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userUsername').value = user.username;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userPassword').value = '';
    document.getElementById('userPassword').placeholder = '留空则不修改密码';
    document.getElementById('passwordRequired').style.display = 'none';
    document.getElementById('userDepartment').value = user.department;
    document.getElementById('userPosition').value = user.position || '';
    document.getElementById('userPhone').value = user.phone || '';
    document.getElementById('userRole').value = user.role;
    document.getElementById('userStatus').value = user.status;
    
    document.getElementById('userModal').classList.add('active');
}

function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
    editingUserId = null;
}

function saveUser() {
    const id = document.getElementById('userId').value;
    const name = document.getElementById('userName').value.trim();
    const username = document.getElementById('userUsername').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const password = document.getElementById('userPassword').value;
    const department = document.getElementById('userDepartment').value;
    const position = document.getElementById('userPosition').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    const role = document.getElementById('userRole').value;
    const status = document.getElementById('userStatus').value;
    
    if (!name || !username || !email || !department || !role) {
        showNotification('请填写所有必填项', 'error');
        return;
    }
    
    let users = getUsers();
    
    if (editingUserId) {
        const index = users.findIndex(u => u.id === editingUserId);
        if (index === -1) {
            showNotification('用户不存在', 'error');
            return;
        }
        
        if (users.some(u => u.username === username && u.id !== editingUserId)) {
            showNotification('用户名已存在', 'error');
            return;
        }
        
        if (users.some(u => u.email === email && u.id !== editingUserId)) {
            showNotification('邮箱已被使用', 'error');
            return;
        }
        
        users[index] = {
            ...users[index],
            name,
            username,
            email,
            department,
            position,
            phone,
            role,
            status
        };
        
        if (password) {
            if (password.length < 6) {
                showNotification('密码至少需要6位', 'error');
                return;
            }
            users[index].password = password;
        }
        
        saveUsers(users);
        showNotification('用户信息已更新', 'success');
    } else {
        if (!password) {
            showNotification('请输入密码', 'error');
            return;
        }
        
        if (password.length < 6) {
            showNotification('密码至少需要6位', 'error');
            return;
        }
        
        if (users.some(u => u.username === username)) {
            showNotification('用户名已存在', 'error');
            return;
        }
        
        if (users.some(u => u.email === email)) {
            showNotification('邮箱已被注册', 'error');
            return;
        }
        
        const newUser = {
            id: Math.max(...users.map(u => u.id), 0) + 1,
            name,
            username,
            email,
            password,
            department,
            position: position || '员工',
            phone,
            role,
            status,
            createdAt: new Date().toISOString().split('T')[0]
        };
        
        users.push(newUser);
        saveUsers(users);
        showNotification('用户添加成功', 'success');
    }
    
    closeUserModal();
    renderUserTable();
    updateStats();
}

function deleteUser(id) {
    deletingUserId = id;
    document.getElementById('deleteConfirmModal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deleteConfirmModal').classList.remove('active');
    deletingUserId = null;
}

function confirmDelete() {
    if (!deletingUserId) return;
    
    let users = getUsers();
    users = users.filter(u => u.id !== deletingUserId);
    saveUsers(users);
    
    closeDeleteModal();
    renderUserTable();
    updateStats();
    showNotification('用户已删除', 'success');
}
