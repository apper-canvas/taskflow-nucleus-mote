import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import { format } from 'date-fns';

// Import icons
const PlusIcon = getIcon('plus');
const ClockIcon = getIcon('clock');
const CheckIcon = getIcon('check');
const EditIcon = getIcon('edit-3');
const TrashIcon = getIcon('trash-2');
const XIcon = getIcon('x');
const TagIcon = getIcon('tag');
const AlertCircleIcon = getIcon('alert-circle');
const CalendarIcon = getIcon('calendar');
const ArrowUpCircleIcon = getIcon('arrow-up-circle');
const ArrowDownCircleIcon = getIcon('arrow-down-circle');
const InProgressIcon = getIcon('loader-circle');
const CheckCircleIcon = getIcon('check-circle');

// Priority mapping
const priorityConfig = {
  low: { icon: ArrowDownCircleIcon, label: 'Low', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  medium: { icon: InProgressIcon, label: 'Medium', color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
  high: { icon: ArrowUpCircleIcon, label: 'High', color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
};

// Status mapping
const statusConfig = {
  'to-do': { icon: ClockIcon, label: 'To Do', color: 'text-gray-500 bg-gray-50 dark:bg-gray-700/30' },
  'in-progress': { icon: InProgressIcon, label: 'In Progress', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  'completed': { icon: CheckCircleIcon, label: 'Completed', color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
};

const MainFeature = ({ projectId }) => {
  // Get initial tasks from localStorage or use default
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        return JSON.parse(savedTasks);
      } catch (e) {
        console.error('Error parsing saved tasks:', e);
        return [];
      }
    }
    return [];
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'to-do',
    tags: '',
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Filter tasks based on status and search term
  const filteredTasks = tasks
    .filter(task => task.projectId === projectId)
    .filter(task => filterStatus === 'all' || task.status === filterStatus)
    .filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.tags && task.tags.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  // Handle form opening
  const openForm = () => {
    setIsFormOpen(true);
    setEditingTaskId(null);
    setTaskForm({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'to-do',
      tags: '',
    });
    setErrors({});
  };

  // Handle form closing
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTaskId(null);
    setErrors({});
  };

  // Handle edit task
  const editTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTaskForm({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate || '',
        priority: task.priority || 'medium',
        status: task.status || 'to-do',
        tags: task.tags || '',
      });
      setEditingTaskId(taskId);
      setIsFormOpen(true);
      setErrors({});
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!taskForm.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (taskForm.dueDate && new Date(taskForm.dueDate) < new Date().setHours(0, 0, 0, 0)) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (editingTaskId) {
      // Update existing task
      const updatedTasks = tasks.map(task => 
        task.id === editingTaskId 
          ? { 
              ...task, 
              ...taskForm,
              updatedAt: new Date().toISOString()
            } 
          : task
      );
      
      setTasks(updatedTasks);
      toast.success('Task updated successfully!');
    } else {
      // Add new task
      const newTask = {
        id: Date.now().toString(),
        ...taskForm,
        projectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setTasks([...tasks, newTask]);
      toast.success('Task created successfully!');
    }
    
    closeForm();
  };

  // Handle task deletion
  const deleteTask = (taskId) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      toast.success('Task deleted successfully!');
    }
  };

  // Handle task status toggle
  const toggleTaskStatus = (taskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'to-do' : 'completed';
        return { 
          ...task, 
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    
    const task = tasks.find(t => t.id === taskId);
    const newStatus = task.status === 'completed' ? 'to-do' : 'completed';
    
    toast.info(`Task marked as ${newStatus === 'completed' ? 'completed' : 'to do'}`);
  };

  return (
    <div>
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Task Manager</h1>
          <p className="text-surface-600 dark:text-surface-400">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary flex items-center gap-2"
          onClick={openForm}
        >
          <PlusIcon className="h-5 w-5" />
          Add New Task
        </motion.button>
      </div>
      
      {/* Search and filter options */}
      <div className="bg-white dark:bg-surface-800 rounded-xl p-4 mb-6 shadow-card border border-surface-200 dark:border-surface-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium mb-1">Search Tasks</label>
            <input
              id="search"
              type="text"
              className="input"
              placeholder="Search by title, description or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-48">
            <label htmlFor="status-filter" className="block text-sm font-medium mb-1">Filter by Status</label>
            <select
              id="status-filter"
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="to-do">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Task list */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-surface-800 rounded-xl p-4 shadow-card border border-surface-200 dark:border-surface-700"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border ${
                    task.status === 'completed'
                      ? 'bg-green-500 border-green-500 flex items-center justify-center'
                      : 'border-surface-300 dark:border-surface-600'
                  }`}
                >
                  {task.status === 'completed' && <CheckIcon className="h-3 w-3 text-white" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h3 className={`text-lg font-medium ${
                      task.status === 'completed' ? 'line-through text-surface-400 dark:text-surface-500' : ''
                    }`}>
                      {task.title}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      {/* Priority badge */}
                      {task.priority && priorityConfig[task.priority] && (
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${priorityConfig[task.priority].color}`}>
                          {/* Properly render the dynamic component */}
                          {React.createElement(priorityConfig[task.priority].icon, { className: "h-3 w-3" })}
                          {priorityConfig[task.priority].label}
                        </span>
                      )}
                      
                      {/* Status badge */}
                      {task.status && statusConfig[task.status] && (
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusConfig[task.status].color}`}>
                          {/* Properly render the dynamic component */}
                          {React.createElement(statusConfig[task.status].icon, { className: "h-3 w-3" })}
                          {statusConfig[task.status].label}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="text-surface-600 dark:text-surface-400 mb-3">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-surface-500">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                    
                    {task.tags && (
                      <div className="flex items-center gap-1 text-surface-500">
                        <TagIcon className="h-4 w-4" />
                        <span>{task.tags}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => editTask(task.id)}
                    className="p-1.5 text-surface-500 hover:text-primary rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
                    aria-label="Edit task"
                  >
                    <EditIcon className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-surface-500 hover:text-red-500 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
                    aria-label="Delete task"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-surface-50 dark:bg-surface-800/50 border border-dashed border-surface-300 dark:border-surface-700 rounded-xl p-8 text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-surface-100 dark:bg-surface-700/50 p-4 rounded-full">
                <ClockIcon className="h-8 w-8 text-surface-400 dark:text-surface-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
            <p className="text-surface-500 dark:text-surface-400 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? "No tasks match your current filters. Try adjusting your search criteria."
                : "You don't have any tasks yet. Click the button below to create your first task."}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                className="btn btn-primary inline-flex items-center gap-2"
                onClick={openForm}
              >
                <PlusIcon className="h-5 w-5" />
                Create Task
              </button>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Task form modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeForm}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-surface-800 rounded-xl shadow-lg w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
                <h2 className="text-xl font-semibold">
                  {editingTaskId ? 'Edit Task' : 'Create New Task'}
                </h2>
                <button
                  onClick={closeForm}
                  className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      className={`input ${errors.title ? 'border-red-500 dark:border-red-500' : ''}`}
                      placeholder="Task title"
                      value={taskForm.title}
                      onChange={handleInputChange}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircleIcon className="h-4 w-4" /> {errors.title}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className="input min-h-[100px]"
                      placeholder="Task description (optional)"
                      value={taskForm.description}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
                        Due Date
                      </label>
                      <input
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        className={`input ${errors.dueDate ? 'border-red-500 dark:border-red-500' : ''}`}
                        value={taskForm.dueDate}
                        onChange={handleInputChange}
                      />
                      {errors.dueDate && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircleIcon className="h-4 w-4" /> {errors.dueDate}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium mb-1">
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        className="input"
                        value={taskForm.priority}
                        onChange={handleInputChange}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium mb-1">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        className="input"
                        value={taskForm.status}
                        onChange={handleInputChange}
                      >
                        <option value="to-do">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium mb-1">
                        Tags
                      </label>
                      <input
                        id="tags"
                        name="tags"
                        type="text"
                        className="input"
                        placeholder="Comma separated tags"
                        value={taskForm.tags}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={closeForm}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingTaskId ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainFeature;