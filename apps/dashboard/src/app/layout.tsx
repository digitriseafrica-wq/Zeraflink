export const metadata = { title: 'Zeraflink Dashboard', description: 'Manage your Zera.Profile' } as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="bg-offwhite text-espresso">
				{children}
			</body>
		</html>
	);
}