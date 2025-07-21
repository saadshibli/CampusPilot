import { useState } from 'react';
import { User, Mail, GraduationCap, Phone } from 'lucide-react';
import useAuthStore from '../../stores/authStore';

const Profile = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Full Name</label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{user?.name}</span>
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{user?.email}</span>
            </div>
          </div>

          <div>
            <label className="label">Student ID</label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
              <GraduationCap className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{user?.studentId}</span>
            </div>
          </div>

          <div>
            <label className="label">Department</label>
            <div className="p-3 bg-gray-50 rounded-md">
              <span className="text-gray-900">{user?.department}</span>
            </div>
          </div>

          <div>
            <label className="label">Year</label>
            <div className="p-3 bg-gray-50 rounded-md">
              <span className="text-gray-900">Year {user?.year}</span>
            </div>
          </div>

          <div>
            <label className="label">Semester</label>
            <div className="p-3 bg-gray-50 rounded-md">
              <span className="text-gray-900">Semester {user?.semester}</span>
            </div>
          </div>

          {user?.phone && (
            <div>
              <label className="label">Phone</label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{user.phone}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 