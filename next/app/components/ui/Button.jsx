// app/components/ui/Button.jsx
import React from "react";
import { buttonStyles } from "../../styles/tailwindStyles";

const Button = ({ variant, children, ...props }) => {
  return (
    <button className={buttonStyles[variant]} {...props}>
      {children}
    </button>
  );
};

export default Button;
