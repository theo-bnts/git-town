'use client';

import React from 'react';

import { DashIcon } from '@primer/octicons-react';

import Button from '@/app/components/ui/Button';

export default function ListBoxItem({ option, onRemove }) {
	return (
		<div className="flex items-center justify-between px-4 py-2">
			<span>{option.value}</span>
			<Button 
				onClick={onRemove} 
				variant="action_sq_warn">
				<DashIcon size={16} />
			</Button>
		</div>
	);
}
