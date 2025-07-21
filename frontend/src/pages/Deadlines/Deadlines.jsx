import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import api from '../../services/api';

const Deadlines = () => {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const response = await api.get('/deadlines/upcoming');
        setDeadlines(response.data.deadlines);
      } catch (error) {
        console.error('Error fetching deadlines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeadlines();
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
        <h1 className="text-2xl font-bold text-gray-900">Deadlines</h1>
        <p className="text-gray-600">Track your assignment and exam deadlines</p>
      </div>

      <div className="space-y-4">
        {deadlines.map((deadline) => (
          <div key={deadline._id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{deadline.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{deadline.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {deadline.class?.name} • Due: {new Date(deadline.dueDate).toLocaleDateString()}
                </p>
              </div>
              <span className="badge-primary">{deadline.type}</span>
            </div>
          </div>
        ))}
      </div>

      {deadlines.length === 0 && (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming deadlines</h3>
          <p className="mt-1 text-sm text-gray-500">
            You're all caught up with your assignments!
          </p>
        </div>
      )}
    </div>
  );
};

export default Deadlines; 