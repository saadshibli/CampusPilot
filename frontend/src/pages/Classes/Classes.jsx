import { useState, useEffect } from 'react';
import { BookOpen, Plus, Search } from 'lucide-react';
import api from '../../services/api';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/classes/enrolled/me');
        setClasses(response.data.classes);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-600">Manage your course schedule and materials</p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Enroll in Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div key={cls._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                <p className="text-sm text-gray-600">{cls.code}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Instructor: {cls.instructor?.name}
                </p>
                <div className="mt-3 flex items-center space-x-2">
                  <span className="badge-primary">{cls.credits} Credits</span>
                  <span className="badge-secondary">Semester {cls.semester}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No classes enrolled</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by enrolling in your first class.
          </p>
        </div>
      )}
    </div>
  );
};

export default Classes; 