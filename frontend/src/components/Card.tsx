import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`
        rounded-2xl 
        bg-card/70 
        backdrop-blur-md 
        border 
        border-neutral-800 
        p-6 
        shadow-md 
        transition 
        hover:shadow-lg
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
}
