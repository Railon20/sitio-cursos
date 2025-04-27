import * as React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border bg-white text-gray-900 shadow-sm ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }: CardProps) {
  return <div className={`border-b px-6 py-4 ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }: CardProps) {
  return (
    <h3 className={`text-lg font-semibold leading-none ${className}`} {...props} />
  );
}

export function CardDescription({ className = "", ...props }: CardProps) {
  return (
    <p className={`text-sm text-gray-500 ${className}`} {...props} />
  );
}

export function CardContent({ className = "", ...props }: CardProps) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props} />
  );
}

export function CardFooter({ className = "", ...props }: CardProps) {
  return (
    <div className={`flex items-center px-6 py-4 border-t ${className}`} {...props} />
  );
}
