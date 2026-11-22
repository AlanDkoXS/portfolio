// ASCII logo and contact lines printed in the browser console (home page).
// Each %c starts the next style of the list below.
export const displayConsoleLogo = () => {
  const logo = `
%c    ___    __                ____        _       __                   
%c   /   |  / /___ _____      / __ \\__  __(_)___  / /_____ _____  ____ _
%c  / /| | / / __ \`/ __ \\    / / / / / / / / __ \\/ __/ __ \`/ __ \\/ __ \`/
%c / ___ |/ / /_/ / / / /   / /_/ / /_/ / / / / / /_/ /_/ / / / / /_/ / 
%c/_/  |_/_/\\__,_/_/ /_/    \\___\\_\\__,_/_/_/ /_/\\__/\\__,_/_/ /_/\\__,_/  
%c
%c🚀 Hello! Welcome to my portfolio
%c💻 Full Stack Designer & Developer
%c🌐 https://alanquintana.pro
%c📧 Contact: https://www.linkedin.com/in/alanxs/
%c
%c💡 Interested in collaborating? Let's talk!
  `;

  const styles = [
    'color: #6366f1; font-weight: bold;', // Line 1
    'color: #8b5cf6; font-weight: bold;', // Line 2
    'color: #a855f7; font-weight: bold;', // Line 3
    'color: #c084fc; font-weight: bold;', // Line 4
    'color: #d8b4fe; font-weight: bold;', // Line 5
    'color: #e9d5ff;', // Empty line
    'color: #10b981; font-size: 16px; font-weight: bold;', // Welcome
    'color: #059669; font-size: 14px;', // Description
    'color: #0891b2; font-size: 14px;', // URL
    'color: #0e7490; font-size: 14px;', // Contact
    'color: #64748b;', // Empty line
    'color: #f59e0b; font-size: 16px; font-weight: bold;', // Call to action
  ];

  console.log(logo, ...styles);
};
