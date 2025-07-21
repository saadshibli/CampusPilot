import { useState, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import api from '../../services/api';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await api.get('/reminders/upcoming');
        setReminders(response.data.reminders);
      } catch (error) {
        console.error('Error fetching reminders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
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
        <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
        <p className="text-gray-600">Manage your personal reminders and notifications</p>
      </div>

      <div className="space-y-4">
        {reminders.map((reminder) => (
          <div key={reminder._id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{reminder.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(reminder.date).toLocaleDateString()} • {reminder.category}
                </p>
              </div>
              <span className="badge-primary">{reminder.priority}</span>
            </div>
          </div>
        ))}
      </div>

      {reminders.length === 0 && (
        <div className="text-center py-12">
          <CalendarDays className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No active reminders</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create a reminder to stay organized!
          </p>
        </div>
      )}
    </div>
  );
};

export default Reminders; 