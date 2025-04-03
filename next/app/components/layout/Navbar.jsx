// app/components/layout/Navbar.jsx
'use client';

import React from "react";
import { textStyles } from "@/app/styles/tailwindStyles";
import Card from "@/app/components/ui/Card";

export default function Navbar({ items, activePanel, onSelect }) {
  return (
    <Card variant="navbar" className="p-4">
      <nav className="h-full flex flex-col justify-center">
        <ul className="justify-content align-items-center flex flex-col gap-20">
          {items.map((item, index) => {
            const isActive = activePanel === item.label;
            const cardVariant = isActive ? "navbar" : "navbar_unselected";
            return (
              <li key={index}>
                <Card variant={cardVariant} className="p-2 group">
                  <button
                    onClick={() => onSelect(item.label)}
                    className="w-full text-center"
                  >
                    <span
                      className={`${
                        isActive ? textStyles.selected : textStyles.default
                      } group-hover:${textStyles.selected}`}
                    >
                      {item.label}
                    </span>
                  </button>
                </Card>
              </li>
            );
          })}
        </ul>
      </nav>
    </Card>
  );
}
