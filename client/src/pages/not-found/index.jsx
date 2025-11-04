
"use client";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-2xl text-center">
        <img
          src="/images/404.svg"
          alt="Page not found"
          width={300}
          height={300}
          className="mx-auto mb-6"
        />
        <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Oops! Page not found</h2>
        <p className="text-gray-600 mb-6">
          The page will be available soon. Please check back later.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-black text-white text-lg rounded-xl hover:bg-gray-800 transition"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
