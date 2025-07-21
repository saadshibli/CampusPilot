import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Bell, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardRes, statsRes] = await Promise.all([
          api.get('/users/dashboard'),
          api.get('/users/stats')
        ]);
        
        setDashboardData(dashboardRes.data);
        setStats(statsRes.data.stats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-danger-600 bg-danger-100';
      case 'high': return 'text-warning-600 bg-warning-100';
      case 'medium': return 'text-primary-600 bg-primary-100';
      case 'low': return 'text-success-600 bg-success-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-primary-100 mt-1">
          Here's what's happening with your academic life today.
        </p>
        <p className="text-sm text-primary-200 mt-2">
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalDeadlines || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.upcomingDeadlines || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-danger-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.overdueDeadlines || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <Calendar className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week's Events</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalEvents || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
            <a href="/deadlines" className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {dashboardData?.dashboard?.upcomingDeadlines?.length > 0 ? (
              dashboardData.dashboard.upcomingDeadlines.map((deadline) => (
                <div key={deadline._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{deadline.title}</p>
                    <p className="text-sm text-gray-600">{deadline.class?.name}</p>
                    <p className="text-xs text-gray-500">
                      Due: {format(new Date(deadline.dueDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(deadline.priority)}`}>
                    {deadline.priority}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <a href="/events" className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {dashboardData?.dashboard?.upcomingEvents?.length > 0 ? (
              dashboardData.dashboard.upcomingEvents.map((event) => (
                <div key={event._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-600">{event.organizer?.name}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(event.date.start), 'MMM dd, yyyy')} at {event.location?.venue}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(event.priority)}`}>
                    {event.type}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming events</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Notices */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Notices</h2>
          <a href="/notices" className="text-sm text-primary-600 hover:text-primary-500">
            View all
          </a>
        </div>
        <div className="space-y-4">
          {dashboardData?.dashboard?.recentNotices?.length > 0 ? (
            dashboardData.dashboard.recentNotices.map((notice) => (
              <div key={notice._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{notice.title}</h3>
                      {notice.isPinned && (
                        <span className="px-2 py-1 text-xs font-medium bg-warning-100 text-warning-800 rounded-full">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notice.content}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>By {notice.issuedBy?.name}</span>
                      <span>{format(new Date(notice.publishDate), 'MMM dd, yyyy')}</span>
                      <span className={`px-2 py-1 rounded-full ${getPriorityColor(notice.priority)}`}>
                        {notice.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent notices</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/classes"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <BookOpen className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">View Classes</span>
          </a>
          <a
            href="/events"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Calendar className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Browse Events</span>
          </a>
          <a
            href="/reminders"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Set Reminders</span>
          </a>
          <a
            href="/profile"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">View Profile</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 