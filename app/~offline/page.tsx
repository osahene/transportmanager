import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold text-blue-800">You're Offline</h1>
      <p className="mt-2 text-gray-600">
        It looks like your internet connection is unstable. 
        Don't worry, you can still fill out booking forms!
      </p>
      <div className="mt-6 space-y-4">
        <Link 
          href="/dashboard" 
          className="block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
        <p className="text-sm text-gray-400">
          Your data will sync automatically once you're back online.
        </p>
      </div>
    </div>
  );
}