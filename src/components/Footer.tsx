export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Catrius Blog
        </p>
        <div className="flex items-center gap-4">
          <a href="https://github.com" aria-label="GitHub" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <svg className="h-5 w-5" fill="currentColor">
              <use href="/icons.svg#github-icon" />
            </svg>
          </a>
          <a href="https://x.com" aria-label="X" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <svg className="h-5 w-5" fill="currentColor">
              <use href="/icons.svg#x-icon" />
            </svg>
          </a>
          <a href="https://bsky.app" aria-label="Bluesky" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <svg className="h-5 w-5" fill="currentColor">
              <use href="/icons.svg#bluesky-icon" />
            </svg>
          </a>
          <a href="https://discord.com" aria-label="Discord" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <svg className="h-5 w-5" fill="currentColor">
              <use href="/icons.svg#discord-icon" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
