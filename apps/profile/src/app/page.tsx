export default function HomePage() {
	return (
		<main className="min-h-screen grid place-items-center p-8">
			<section className="max-w-xl text-center space-y-6">
				<h1 className="text-4xl font-bold">Zeraflink Profiles</h1>
				<p className="text-olive">Visit /[username] to view a profile page.</p>
				<div className="flex items-center justify-center gap-3">
					<a className="btn-primary" href="/demo">Open demo profile</a>
				</div>
			</section>
		</main>
	);
}