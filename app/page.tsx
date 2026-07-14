import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-semibold text-black">
          Welcome to QuizForge
        </h1>
        <p className="text-zinc-600">
          Create quizzes and manage your classroom, all in one place.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-6 py-3 rounded-full bg-black text-white font-medium hover:bg-zinc-800"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 rounded-full border border-black text-black font-medium hover:bg-zinc-100"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}