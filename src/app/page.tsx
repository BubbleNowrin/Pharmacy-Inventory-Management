export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Pharmacy Inventory System</h1>
        <p className="text-gray-600">Application is working!</p>
        <a href="/login" className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded">
          Go to Login
        </a>
      </div>
    </div>
  );
}
