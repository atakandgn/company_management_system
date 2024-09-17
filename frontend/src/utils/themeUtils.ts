export const setDarkMode = (isDarkMode: boolean) => {
  const root = window.document.documentElement;

  if (isDarkMode) {
    root.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    root.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
};

export const toggleDarkMode = () => {
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") {
    setDarkMode(false);
  } else {
    setDarkMode(true);
  }
};

export const initializeDarkMode = () => {
  const storedTheme = localStorage.getItem("theme");

  // Default to system preference if no theme is set
  if (storedTheme) {
    setDarkMode(storedTheme === "dark");
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    setDarkMode(true);
  } else {
    setDarkMode(false);
  }
};

// New function to check the current theme
export const checkTheme = () => {
  const currentTheme = localStorage.getItem("theme");

  if (currentTheme) {
    return currentTheme; // Return either 'dark' or 'light' from localStorage
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark"; 
  } else {
    return "light"; 
  }
};
