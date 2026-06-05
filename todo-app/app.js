class TaskMasterApp {
    constructor() {
        this.storage = storage;
        this.currentFilter = 'all';
        this.currentSort = 'date-created';
        this.currentSearch = '';
        this.editingTaskId = null;
        this.initializeElements();
        this.attachEventListeners();
        this.render();
    }

    initializeElements() {
        this.taskInput = document.getElementById('task-input');
        this.prioritySelect = document.getElementById('priority-select');
        this.projectSelect = document.getElementById('project-select');
        this.dueDateInput = document.getElementById('due-date-input');
        this.searchInput = document.getElementById('search-input');
        this.btnAddTask = document.getElementById('btn-add-task');
        this.btnClearCompleted = document.getElementById('btn-clear-completed');
        this.btnResetAll = document.getElementById('btn-reset-all');
        this.btnAddProject = document.querySelector('.btn-add-project');
        this.navItems = document.querySelectorAll('.nav-item');
        this.editModal = document.getElementById('edit-modal');
        this.projectModal = document.getElementById('project-modal');
        this.modalCloseButtons = document.querySelectorAll('.modal-close');
        this.editTaskText = document.getElementById('edit-task-text');
        this.editTaskDescription = document.getElementById('edit-task-description');
        this.editTaskPriority = document.getElementById('edit-task-priority');
        this.editTaskDueDate = document.getElementById('edit-task-due-date');
        this.editTaskProject = document.getElementById('edit-task-project');
        this.projectName = document.getElementById('project-name');
        this.projectColor = document.getElementById('project-color');
        this.btnModalCancel = document.getElementById('btn-modal-cancel');
        this.btnModalSave = document.getElementById('btn-modal-save');
        this.btnProjectCancel = document.getElementById('btn-project-cancel');
        this.btnProjectSave = document.getElementById('btn-project-save');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.tasksContainer = document.getElementById('tasks-container');
        this.projectsList = document.getElementById('projects-list');
        this.statTotal = document.getElementById('stat-total');
        this.statActive = document.getElementById('stat-active');
        this.statCompleted = document.getElementById('stat-completed');
        this.statCompletion = document.getElementById('stat-completion');
        this.badgeAll = document.getElementById('badge-all');
        this.badgeActive = document.getElementById('badge-active');
        this.badgeCompleted = document.getElementById('badge-completed');
        this.badgeHighPriority = document.getElementById('badge-high-priority');
        this.storageUsed = document.getElementById('storage-used');
    }

    attachEventListeners() {
        this.taskInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') this.addTask();
        });
        this.btnAddTask.addEventListener('click', () => this.addTask());
        this.navItems.forEach(item => item.addEventListener('click', () => this.setFilter(item.dataset.filter)));
        this.filterButtons.forEach(btn => btn.addEventListener('click', e => {
            this.filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            this.currentSort = e.target.dataset.sort;
            this.render();
        }));
        this.searchInput.addEventListener('input', e => {
            this.currentSearch = e.target.value;
            this.render();
        });
        this.btnClearCompleted.addEventListener('click', () => this.clearCompleted());
        this.btnResetAll.addEventListener('click', () => this.resetAll());
        this.btnAddProject.addEventListener('click', () => this.showProjectModal());
        this.modalCloseButtons.forEach(btn => btn.addEventListener('click', e => {
            e.target.closest('.modal').classList.add('hidden');
        }));
        this.btnModalCancel.addEventListener('click', () => this.editModal.classList.add('hidden'));
        this.btnModalSave.addEventListener('click', () => this.saveTaskEdit());
        this.btnProjectCancel.addEventListener('click', () => this.projectModal.classList.add('hidden'));
        this.btnProjectSave.addEventListener('click', () => this.saveProject());
        window.addEventListener('click', e => {
            if (e.target.classList.contains('modal')) e.target.classList.add('hidden');
        });
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) { this.showToast('الرجاء إدخال مهمة', 'info'); return; }
        this.storage.addTask({
            text,
            priority: this.prioritySelect.value,
            project: this.projectSelect.value,
            dueDate: this.dueDateInput.value
        });
        this.taskInput.value = '';
        this.prioritySelect.value = 'medium';
        this.projectSelect.value = '';
        this.dueDateInput.value = '';
        this.showToast('تم إضافة المهمة', 'success');
        this.render();
    }

    deleteTask(taskId) {
        if (confirm('هل تريد حذف المهمة؟')) {
            this.storage.deleteTask(taskId);
            this.showToast('تم الحذف', 'success');
            this.render();
        }
    }

    toggleTask(taskId) {
        this.storage.toggleTask(taskId);
        this.render();
    }

    openEditModal(taskId) {
        const tasks = this.storage.getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        this.editingTaskId = taskId;
        this.editTaskText.value = task.text;
        this.editTaskDescription.value = task.description;
        this.editTaskPriority.value = task.priority;
        this.editTaskDueDate.value = task.dueDate;
        this.editTaskProject.value = task.project;
        this.updateProjectOptions(this.editTaskProject);
        this.editModal.classList.remove('hidden');
    }

    saveTaskEdit() {
        const updates = {
            text: this.editTaskText.value.trim(),
            description: this.editTaskDescription.value.trim(),
            priority: this.editTaskPriority.value,
            dueDate: this.editTaskDueDate.value,
            project: this.editTaskProject.value
        };
        if (!updates.text) { this.showToast('العنوان مطلوب', 'error'); return; }
        this.storage.updateTask(this.editingTaskId, updates);
        this.editModal.classList.add('hidden');
        this.showToast('تم التحديث', 'success');
        this.render();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.navItems.forEach(item => item.classList.toggle('active', item.dataset.filter === filter));
        this.render();
    }

    getDisplayTasks() {
        let tasks = this.storage.filterTasks(this.currentFilter);
        if (this.currentSearch) {
            tasks = tasks.filter(task => task.text.toLowerCase().includes(this.currentSearch.toLowerCase()));
        }
        return this.storage.sortTasks(tasks, this.currentSort);
    }

    renderTasks() {
        const tasks = this.getDisplayTasks();
        if (tasks.length === 0) {
            this.tasksContainer.innerHTML = '<div class="empty-state"><span class="empty-icon">📭</span><p>لا توجد مهام</p></div>';
            return;
        }
        this.tasksContainer.innerHTML = tasks.map(task => this.createTaskElement(task)).join('');
        this.tasksContainer.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', e => this.toggleTask(e.target.dataset.taskId));
        });
        this.tasksContainer.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', e => this.openEditModal(e.target.dataset.taskId));
        });
        this.tasksContainer.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', e => this.deleteTask(e.target.dataset.taskId));
        });
    }

    createTaskElement(task) {
        const project = this.storage.getProjects().find(p => p.id === task.project);
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        return `<div class="task-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-task-id="${task.id}">
            <div class="task-content">
                <div class="task-text">${task.text}</div>
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                    ${task.dueDate ? `<span class="task-due-date ${isOverdue ? 'overdue' : ''}">${new Date(task.dueDate).toLocaleDateString('ar-SA')}</span>` : ''}
                    ${project ? `<span class="task-project" style="background-color: ${project.color}">${project.name}</span>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="task-btn edit-btn" data-task-id="${task.id}">✏️</button>
                <button class="task-btn delete-btn" data-task-id="${task.id}">🗑️</button>
            </div>
        </div>`;
    }

    renderProjects() {
        const projects = this.storage.getProjects();
        if (projects.length === 0) { this.projectsList.innerHTML = ''; return; }
        this.projectsList.innerHTML = projects.map(project => {
            const taskCount = this.storage.getTasksByProject(project.id).length;
            return `<div class="project-item" data-project-id="${project.id}">
                <div class="project-color" style="background-color: ${project.color}"></div>
                <div class="project-name">${project.name}</div>
                <div class="project-count">${taskCount}</div>
            </div>`;
        }).join('');
        this.updateProjectSelects();
    }

    updateProjectSelects() {
        const projects = this.storage.getProjects();
        const options = '<option value="">اختر مشروع</option>' + projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        this.projectSelect.innerHTML = options;
        this.editTaskProject.innerHTML = '<option value="">بدون</option>' + projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }

    updateProjectOptions(selectElement) {
        const projects = this.storage.getProjects();
        selectElement.innerHTML = '<option value="">بدون</option>' + projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }

    showProjectModal() {
        this.projectName.value = '';
        this.projectColor.value = '#3498db';
        this.projectModal.classList.remove('hidden');
        this.projectName.focus();
    }

    saveProject() {
        const name = this.projectName.value.trim();
        if (!name) { this.showToast('أدخل اسم المشروع', 'info'); return; }
        this.storage.addProject({ name, color: this.projectColor.value });
        this.projectModal.classList.add('hidden');
        this.showToast('تم إنشاء المشروع', 'success');
        this.render();
    }

    updateStats() {
        const stats = this.storage.getStats();
        this.statTotal.textContent = stats.total;
        this.statActive.textContent = stats.active;
        this.statCompleted.textContent = stats.completed;
        this.statCompletion.textContent = stats.completionRate + '%';
        this.badgeAll.textContent = stats.total;
        this.badgeActive.textContent = stats.active;
        this.badgeCompleted.textContent = stats.completed;
        this.badgeHighPriority.textContent = stats.highPriority;
        this.storageUsed.textContent = this.storage.getStorageUsage();
    }

    clearCompleted() {
        if (confirm('حذف المهام المكتملة؟')) {
            const cleared = this.storage.clearCompleted();
            this.showToast(`تم حذف ${cleared} مهام`, 'success');
            this.render();
        }
    }

    resetAll() {
        if (confirm('هذا سيحذف كل البيانات. متأكد؟')) {
            this.storage.resetAll();
            this.showToast('تم إعادة التعيين', 'success');
            this.render();
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.getElementById('toast-container').appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    render() {
        this.renderTasks();
        this.renderProjects();
        this.updateStats();
    }
}

document.addEventListener('DOMContentLoaded', () => new TaskMasterApp());