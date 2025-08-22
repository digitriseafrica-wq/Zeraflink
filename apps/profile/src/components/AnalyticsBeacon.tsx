"use client";

import { useEffect } from 'react';

export function AnalyticsBeacon({ username }: { username: string }) {
	useEffect(() => {
		const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
		fetch(`${apiBase}/api/analytics/profile-view`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username }),
		}).catch(() => {});
	}, [username]);
	return null;
}

export function trackLinkClick(linkId: string) {
	const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
	fetch(`${apiBase}/api/analytics/link-click`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ linkId }),
	}).catch(() => {});
}