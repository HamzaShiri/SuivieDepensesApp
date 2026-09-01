import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, colorTheme = 'blue', trend }) => {
  const themeStyles = {
    blue: {
      bg: 'from-blue-500/10 via-blue-500/5 to-transparent border-blue-200/50 dark:border-blue-800/50',
      iconBg: 'bg-blue-600 text-white shadow-blue-500/30',
      text: 'text-blue-600 dark:text-blue-400'
    },
    emerald: {
      bg: 'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200/50 dark:border-emerald-800/50',
      iconBg: 'bg-emerald-600 text-white shadow-emerald-500/30',
      text: 'text-emerald-600 dark:text-emerald-400'
    },
    purple: {
      bg: 'from-purple-500/10 via-purple-500/5 to-transparent border-purple-200/50 dark:border-purple-800/50',
      iconBg: 'bg-purple-600 text-white shadow-purple-500/30',
      text: 'text-purple-600 dark:text-purple-400'
    }
  }[colorTheme] || {
    bg: 'from-gray-500/10 to-transparent border-gray-200 dark:border-gray-800',
    iconBg: 'bg-gray-600 text-white',
    text: 'text-gray-700 dark:text-gray-300'
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4 bg-gradient-to-br bg-white dark:bg-gray-800/90 shadow-sm hover:shadow-md transition-all duration-300 ${themeStyles.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md ${themeStyles.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-1">
        <div className={`text-xl font-extrabold tracking-tight ${themeStyles.text}`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
