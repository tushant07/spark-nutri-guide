
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    setMounted(true);
    
    // Check if we have a theme in localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    
    // Check system preference if no saved theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme based on saved preference or system preference
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    
    // Apply theme to document
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Store theme preference
    localStorage.setItem('theme', newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 bg-background text-foreground border-border hover:bg-accent dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700 dark:text-white"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon size={20} className="text-foreground dark:text-white" />
      ) : (
        <Sun size={20} className="text-yellow-300" />
      )}
    </Button>
  );
};

export default ThemeToggle;
