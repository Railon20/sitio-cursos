// src/components/ui/accordion.tsx
'use client';


import React, { useState } from "react";

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
}

interface AccordionProps {
  type: "single";
  collapsible: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ children, className }) => {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
};

export const AccordionItem: React.FC<AccordionItemProps> = ({ value, children }) => {
  return <div className="border rounded-md">{children}</div>;
};

export const AccordionTrigger: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      className="cursor-pointer font-semibold p-4 bg-gray-100 hover:bg-gray-200 flex justify-between items-center"
      {...props}
    >
      <span>{children}</span>
      <span>{open ? "−" : "+"}</span>
    </div>
  );
};

export const AccordionContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="p-4 border-t text-sm text-gray-700">{children}</div>;
};
