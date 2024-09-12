export default function Footer() {
  return (
    <footer className="bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-sm">
          <p>© {new Date().getFullYear()} Market Lens - Brandon Ling</p>
        </div>
      </div>
    </footer>
  );
} 