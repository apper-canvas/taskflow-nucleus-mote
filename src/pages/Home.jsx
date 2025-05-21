import { useState } from 'react';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

const CheckCircleIcon = getIcon('check-circle');
const MoonIcon = getIcon('moon');
const SunIcon = getIcon('sun');
const ListTodoIcon = getIcon('list-todo');

const Home = ({ darkMode, toggleDarkMode }) => {
  const [projects, setProjects] = useState([
    { id: 'default', name: 'Personal Tasks', color: '#3B82F6' }
  ]);
  
  const [activeProject, setActiveProject] = useState('default');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navigation */}
      <header className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5">
              <CheckCircleIcon className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold">TaskFlow</h1>
          </div>
          
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 text-surface-600" />
            )}
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar */}
        <motion.aside 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full md:w-64 lg:w-72 bg-surface-50 dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 p-4"
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <ListTodoIcon className="h-5 w-5 text-primary" />
              Projects
            </h2>
            <ul className="space-y-1">
              {projects.map(project => (
                <li key={project.id}>
                  <button
                    className={`w-full text-left py-2 px-3 rounded-lg transition-colors flex items-center gap-2 ${
                      activeProject === project.id 
                        ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                        : 'hover:bg-surface-100 dark:hover:bg-surface-700'
                    }`}
                    onClick={() => setActiveProject(project.id)}
                  >
                    <span 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: project.color }}
                    ></span>
                    {project.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
            <p className="text-sm text-surface-500 dark:text-surface-400">
              TaskFlow helps you organize your tasks efficiently and boost your productivity.
            </p>
          </div>
        </motion.aside>
        
        {/* Main content area */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <MainFeature projectId={activeProject} />
        </main>
      </div>
    </div>
  );
};

export default Home;