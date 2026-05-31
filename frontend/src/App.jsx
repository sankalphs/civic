import { Routes, Route, Link, useLocation } from 'react-router-dom'
import IssueForm from './components/IssueForm'
import IssueList from './components/IssueList'
import IssueTracker from './components/IssueTracker'
import AdminDashboard from './components/AdminDashboard'

function NavBar() {
  const location = useLocation()
  const isAdmin = location.pathname === '/admin'

  if (isAdmin) return null

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🏛️</span>
          <span className="font-bold text-gray-800">CivicBLR</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className={`text-sm font-medium ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Report
          </Link>
          <Link
            to="/issues"
            className={`text-sm font-medium ${location.pathname === '/issues' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            My Reports
          </Link>
          <Link
            to="/track"
            className={`text-sm font-medium ${location.pathname.startsWith('/track') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Track
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <Routes>
        <Route path="/" element={<IssueForm />} />
        <Route path="/issues" element={<IssueList />} />
        <Route path="/track" element={<IssueTracker />} />
        <Route path="/track/:trackingId" element={<IssueTracker />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  )
}
