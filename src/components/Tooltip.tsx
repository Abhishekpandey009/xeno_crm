import { ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
}

const Tooltip = ({ content, children }: TooltipProps) => {
  return (
    <div className="group relative inline-block">
      {children}
      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block text-xs bg-black text-white px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
        {content}
      </span>
    </div>
  );
};

export default Tooltip;