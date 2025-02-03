import React from "react";

import { buttonStyles } from "../styles/tailwindStyles";

const Button = ({ variant, children }) => {
    return <button className={buttonStyles[variant]}>{children}</button>;
};

export default Button;
