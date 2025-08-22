import Image from 'next/image';
import Link from 'next/link';
import { AnalyticsBeacon, trackLinkClick } from '@/components/AnalyticsBeacon';

async function fetchProfile(username: string) {
	const apiBase = process.env.API_BASE_URL || 'http://localhost:4000';
	const res = await fetch(`${apiBase}/api/profiles/${username}`, { next: { revalidate: 30 } });
	if (!res.ok) return null;
	return res.json();
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
	const data = await fetchProfile(params.username);
	if (!data) {
		return (
			<main className="min-h-screen grid place-items-center p-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold">Profile not found</h1>
					<p className="text-olive mt-2">The username {params.username} does not exist.</p>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen p-6">
			<AnalyticsBeacon username={params.username} />
			<header className="max-w-xl mx-auto text-center space-y-4">
				{data.bannerUrl && (
					<div className="w-full h-40 relative rounded-md overflow-hidden">
						<Image src={data.bannerUrl} alt="banner" fill className="object-cover" />
					</div>
				)}
				{data.avatarUrl && (
					<div className="w-24 h-24 relative mx-auto rounded-full overflow-hidden ring-4 ring-offwhite -mt-12">
						<Image src={data.avatarUrl} alt={data.displayName} fill className="object-cover" />
					</div>
				)}
				<h1 className="text-3xl font-bold">{data.displayName}</h1>
				{data.bio && <p className="text-olive">{data.bio}</p>}
			</header>
			<section className="max-w-xl mx-auto mt-8 grid gap-3">
				{data.links?.map((l: any) => (
					<Link
						key={l.id}
						href={l.url}
						target="_blank"
						rel="noopener noreferrer"
						className="btn-secondary"
						onClick={() => trackLinkClick(l.id)}
					>
						{l.title}
					</Link>
				))}
			</section>
		</main>
	);
}