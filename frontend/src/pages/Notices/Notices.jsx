import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import api from '../../services/api';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await api.get('/notices');
        setNotices(response.data.notices);
      } catch (error) {
        console.error('Error fetching notices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
        <p className="text-gray-600">Stay updated with college announcements</p>
      </div>

      <div className="space-y-4">
        {notices.map((notice) => (
          <div key={notice._id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{notice.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  By {notice.issuedBy?.name} • {notice.type}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notices.length === 0 && (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No notices</h3>
          <p className="mt-1 text-sm text-gray-500">
            You're all caught up!
          </p>
        </div>
      )}
    </div>
  );
};

export default Notices; 