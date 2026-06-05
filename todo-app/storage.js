class StorageManager {
    constructor() {
        this.storageKey = 'taskmaster_data';
        this.initializeStorage();
    }

    initializeStorage() {
        if (!this.getData()) {
            const defaultData = {
                tasks: [],
                projects: [],
                settings: { sortBy: 'date-created', theme: 'light' }
            };
            this.setData(defaultData);
        }
    }

    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    }

    setData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error writing to storage:', error);
            return false;
        }
    }

    addTask(taskData) {
        const data = this.getData();
        const newTask = {
            id: Date.now().toString(),
            text: taskData.text,
            description: taskData.description || '',
            completed: false,
            priority: taskData.priority || 'medium',
            project: taskData.project || '',
            dueDate: taskData.dueDate || '',
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        data.tasks.push(newTask);
        this.setData(data);
        return newTask;
    }

    updateTask(taskId, updates) {
        const data = this.getData();
        const taskIndex = data.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return null;
        data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...updates };
        this.setData(data);
        return data.tasks[taskIndex];
    }

    deleteTask(taskId) {
        const data = this.getData();
        const taskIndex = data.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;
        data.tasks.splice(taskIndex, 1);
        this.setData(data);
        return true;
    }

    getTasks() {
        const data = this.getData();
        return data ? data.tasks : [];
    }

    toggleTask(taskId) {
        const data = this.getData();
        const task = data.tasks.find(t => t.id === taskId);
        if (!task) return null;
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        this.setData(data);
        return task;
    }

    filterTasks(status) {
        const tasks = this.getTasks();
        switch(status) {
            case 'active': return tasks.filter(t => !t.completed);
            case 'completed': return tasks.filter(t => t.completed);
            case 'high-priority': return tasks.filter(t => t.priority === 'high' && !t.completed);
            default: return tasks;
        }
    }

    sortTasks(tasks, sortBy) {
        const sorted = [...tasks];
        switch(sortBy) {
            case 'date-created':
                return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'due-date':
                return sorted.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            case 'alphabetical':
                return sorted.sort((a, b) => a.text.localeCompare(b.text, 'ar'));
            default: return sorted;
        }
    }

    addProject(projectData) {
        const data = this.getData();
        const newProject = {
            id: Date.now().toString(),
            name: projectData.name,
            color: projectData.color || '#3498db',
            createdAt: new Date().toISOString()
        };
        data.projects.push(newProject);
        this.setData(data);
        return newProject;
    }

    getProjects() {
        const data = this.getData();
        return data ? data.projects : [];
    }

    deleteProject(projectId) {
        const data = this.getData();
        const projectIndex = data.projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) return false;
        data.tasks.forEach(task => {
            if (task.project === projectId) task.project = '';
        });
        data.projects.splice(projectIndex, 1);
        this.setData(data);
        return true;
    }

    getTasksByProject(projectId) {
        const tasks = this.getTasks();
        return tasks.filter(t => t.project === projectId);
    }

    getStats() {
        const tasks = this.getTasks();
        const completed = tasks.filter(t => t.completed).length;
        const active = tasks.filter(t => !t.completed).length;
        const total = tasks.length;
        const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
        return { total, active, completed, completionRate, highPriority: tasks.filter(t => t.priority === 'high' && !t.completed).length };
    }

    getStorageUsage() {
        const data = this.getData();
        const size = new Blob([JSON.stringify(data)]).size;
        return Math.round(size / 1024);
    }

    clearCompleted() {
        const data = this.getData();
        const completedCount = data.tasks.filter(t => t.completed).length;
        data.tasks = data.tasks.filter(t => !t.completed);
        this.setData(data);
        return completedCount;
    }

    resetAll() {
        this.initializeStorage();
    }
}

const storage = new StorageManager();