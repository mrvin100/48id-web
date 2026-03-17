import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-indigo-600">
            <span className="text-2xl font-bold text-white">48</span>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
            48ID Admin Portal
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Identity and Access Management System
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
          >
            Access Admin Portal
          </Link>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Restricted to authorized administrators only
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
            <div>
              <div className="font-semibold text-gray-700">Secure</div>
              <div>JWT Authentication</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Fast</div>
              <div>Next.js 16</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Modern</div>
              <div>React 19</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
