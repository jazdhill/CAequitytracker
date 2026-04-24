export const metadata = {
  title: "California Equity Legislative Tracker",
  description: "Analyzing California bills through a racial equity lens",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#000" }}>
        {children}
      </body>
    </html>
  );
}
