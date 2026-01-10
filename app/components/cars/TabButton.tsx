import { ReactNode } from "react";

interface TabButtonProps {
  tab: string;
  activeTab: string;
  onClick: (tab: string) => void;
  icon?: ReactNode;
  count?: number;
}

const TabButton: React.FC<TabButtonProps> = ({
  tab,
  activeTab,
  onClick,
  icon,
  count,
}) => {
  const formatTabName = (tabName: string) => {
    return tabName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <button
      onClick={() => onClick(tab)}
      className={`
        relative py-2 px-1 border-b-2 font-medium text-sm transition-colors
        flex items-center gap-2
        ${
          activeTab === tab
            ? "border-blue-500 text-blue-600 dark:text-blue-400"
            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
        }
      `}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span>{formatTabName(tab)}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`
          text-xs px-1.5 py-0.5 rounded-full min-w-5 flex items-center justify-center
          ${
            activeTab === tab
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          }
        `}
        >
          {count}
        </span>
      )}
    </button>
  );
};

export default TabButton;
