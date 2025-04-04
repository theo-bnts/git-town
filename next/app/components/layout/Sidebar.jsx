// app/components/layout/Sidebar.jsx
'use client';

import React from "react";
import { textStyles } from "@/app/styles/tailwindStyles";
import Card from "@/app/components/ui/Card";

export default function Sidebar({ items, activePanel, onSelect, className = "" }) {
  return (
    <Card
        variant="navbar"
        className={`flex flex-col justify-start items-stretch overflow-auto ${className}`}
    >
      {items.map((item, index) => {
        const isActive = activePanel === item.label;
        const cardVariant = isActive ? "navbar" : "navbar_unselected";
        return (
          <li key={index} className="list-none w-full flex-shrink-0">
            <Card variant={cardVariant} className="w-full">
              <button
                className="w-full text-center py-10 px-4"
                onClick={() => onSelect(item.label)}
              >
                <span
                  className={
                    isActive ? textStyles.selected : textStyles.default
                  }
                >
                  {item.label}
                </span>
              </button>
            </Card>
          </li>
        );
      })}
    </Card>
  );
}