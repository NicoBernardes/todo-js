class TodoList {
    constructor() {
        this.tasks = this.getStoredTasks();
        this.currentFilter = 'all';
        this.initializeElements();
        this.bindEvents();
        this.render();
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.taskCount = document.getElementById('taskCount');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        this.taskList.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                this.deleteTask(taskId);
            }
        });

        this.taskList.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                this.toggleTask(taskId);
            }
        });
    }

    getStoredTasks() {
        try {
            const stored = localStorage.getItem('todoTasks');
            if (!stored || stored === 'undefined') {
                return [];
            }
            return JSON.parse(stored);
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            return [];
        }
    }

    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    addTask() {
        console.log('addTask chamado, this:', this);
        console.log('tasks array:', this.tasks);
        
        const text = this.taskInput.value.trim();
        
        if (text === '') {
            alert('Por favor, digite uma tarefa!');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.taskInput.value = '';
        this.saveTasks();
        this.render();
    }

    toggleTask(id) {
        this.tasks = this.tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        this.saveTasks();
        this.render();
    }

    deleteTask(id) {
        if (confirm('Tem certeza que deseja excluir essa tarefa?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(task => task.completed).length;

        if (completedCount === 0) {
            alert('Não há tarefas concluídas para limpar!');
            return;
        }
        
        if (confirm(`Deseja limpar ${completedCount} tarefa(s) concluída(s)?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;

        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        this.taskCount.textContent = `Total: ${total} | Pendentes: ${pending} | Concluídas: ${completed}`;
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.taskList.innerHTML = '<div class="empty-state">Nenhuma tarefa encontrada</div>';
        } else {
            this.taskList.innerHTML = filteredTasks.map(task => `
                <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        ${task.completed ? 'checked' : ''}
                    >
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    <button class="delete-btn">🗑️</button>
                </li>
            `).join('');
        }
        
        this.updateStats();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const todoList = new TodoList();

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('taskInput').focus();
});