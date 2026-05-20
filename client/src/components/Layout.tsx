import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  user: { name: string; email: string };
  onLogout: () => void;
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/generate', label: 'AI Generate' },
  { path: '/create-question', label: 'Create Question' },
  { path: '/questions', label: 'My Questions' },
  { path: '/session/new', label: 'New Session' },
];

export default function Layout({ user, onLogout, children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-800 text-white flex flex-col">
        <div className="p-6 border-b border-indigo-700">
          <h1 className="text-xl font-bold">Hinge Questions</h1>
          <p className="text-indigo-300 text-sm mt-1">Diagnostic Assessment Tool</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                location.pathname === item.path
                  ? 'bg-indigo-600 text-white'
                  : 'text-indigo-200 hover:bg-indigo-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-indigo-700">
          <p className="text-sm text-indigo-300 truncate">{user.name}</p>
          <button
            onClick={onLogout}
            className="mt-2 text-sm text-indigo-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
