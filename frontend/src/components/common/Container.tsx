import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Whether to add horizontal padding. Defaults to true.
   */
  padding?: boolean;
}

/**
 * A centralized container component to manage application-wide maximum width
 * and horizontal alignment. Use this for all main content sections to ensure
 * visual consistency.
 */
const Container: React.FC<ContainerProps> = ({
  children,
  className = "",
  padding = true,
}) => {
  return (
    <div
      className={`max-w-7xl mx-auto w-full ${
        padding ? "px-4 md:px-10" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;
