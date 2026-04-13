// 全局变量
let currentCheckinStatus = 'out'; // 'in' 或 'out'
let checkinTime = null;
let checkoutTime = null;
let hasCheckedIn = false; // 是否已打过上班卡

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initCurrentTime();
    initLocation();
    initEventListeners();
    initDateInputs();
    calculateLeaveDays();
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

    // 审批列表复选框监听
    const itemCheckboxes = document.querySelectorAll('.item-checkbox');
    itemCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateSelectAllState);
    });
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
    
    if (!hasCheckedIn) {
        // 上班打卡（只能打一次）
        checkinTime = now;
        hasCheckedIn = true;
        currentCheckinStatus = 'in';
        
        document.getElementById('checkInTime').textContent = timeString;
        document.getElementById('todayStatus').textContent = '工作中';
        document.getElementById('todayStatus').className = 'status-badge approved';
        
        const btn = document.getElementById('checkinBtn');
        btn.querySelector('span').textContent = '下班打卡';
        btn.style.background = 'linear-gradient(135deg, #ef4444, #f87171)';
        
        showNotification('上班打卡成功！', 'success');
    } else {
        // 下班打卡（可以多次打卡更新时间）
        checkoutTime = now;
        
        document.getElementById('checkOutTime').textContent = timeString;
        document.getElementById('todayStatus').textContent = '已下班';
        document.getElementById('todayStatus').className = 'status-badge approved';
        
        // 计算工作时长
        const duration = calculateDuration(checkinTime, checkoutTime);
        document.getElementById('workDuration').textContent = duration;
        
        showNotification('下班打卡成功！时间已更新', 'success');
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
    
    if (startDate) {
        startDate.min = today;
        startDate.addEventListener('change', function() {
            if (endDate && this.value) {
                endDate.min = this.value;
                if (endDate.value && endDate.value < this.value) {
                    endDate.value = this.value;
                    showNotification('结束日期已自动调整为开始日期', 'info');
                }
            }
            calculateLeaveDays();
        });
    }
    if (endDate) {
        endDate.min = today;
        endDate.addEventListener('change', function() {
            if (startDate && startDate.value && this.value < startDate.value) {
                this.value = startDate.value;
                showNotification('结束日期不能早于开始日期', 'error');
            }
            calculateLeaveDays();
        });
    }
}

// 计算请假天数
function calculateLeaveDays() {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const leaveDays = document.getElementById('leaveDays');
    
    if (startDate && endDate && leaveDays && startDate.value && endDate.value) {
        const start = new Date(startDate.value);
        const end = new Date(endDate.value);
        
        if (end >= start) {
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            leaveDays.value = diffDays + '天';
        } else {
            leaveDays.value = '';
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
    updateSelectAllState();
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
    updateSelectAllState();
    updateBadgeCount();
}

function toggleSelectAll(containerId, checkbox) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const checkboxes = container.querySelectorAll('.item-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = checkbox.checked;
    });
}

function updateSelectAllState() {
    const containers = ['leaveApproval', 'exceptionApproval'];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const checkboxes = container.querySelectorAll('.item-checkbox');
        const checkedBoxes = container.querySelectorAll('.item-checkbox:checked');
        const selectAllId = containerId === 'leaveApproval' ? 'selectAllLeave' : 'selectAllException';
        const selectAllCheckbox = document.getElementById(selectAllId);
        
        if (selectAllCheckbox && checkboxes.length > 0) {
            selectAllCheckbox.checked = checkboxes.length === checkedBoxes.length;
        }
    });
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

// 点击弹窗外部关闭
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
