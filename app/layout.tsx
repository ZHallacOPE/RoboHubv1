import "./globals.css";

export const metadata = {
  title: "Robotic Mower Hub",
  description: "hub.robomaintain.com",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
