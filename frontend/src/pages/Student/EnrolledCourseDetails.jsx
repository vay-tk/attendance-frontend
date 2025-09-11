import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import { coursesAPI } from '../../api/courses';
import { motion } from 'framer-motion';

const EnrolledCourseDetails = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await coursesAPI.getCourseById(courseId);
        setCourse(res.data.data.course);
      } catch (err) {
        setError('Failed to fetch course details');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="large" /></div>;
  }
  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }
  if (!course) {
    return <div className="text-center py-12">Course not found</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6 card card-padding mt-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{course.code} - {course.title}</h1>
        <Link to="/dashboard">
          <Button variant="outline" size="small">Back</Button>
        </Link>
      </div>
      <div className="text-gray-700 mb-2">{course.description}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="font-medium">Department:</div>
          <div>{course.department}</div>
        </div>
        <div>
          <div className="font-medium">Faculty:</div>
          <div>{course.facultyId?.name} ({course.facultyId?.email})</div>
        </div>
        <div>
          <div className="font-medium">Semester:</div>
          <div>{course.semester}</div>
        </div>
        <div>
          <div className="font-medium">Credits:</div>
          <div>{course.credits}</div>
        </div>
        <div>
          <div className="font-medium">Academic Year:</div>
          <div>{course.academicYear}</div>
        </div>
        <div>
          <div className="font-medium">Attendance Threshold:</div>
          <div>{course.attendanceThreshold}%</div>
        </div>
      </div>
      {course.schedule && course.schedule.length > 0 && (
        <div>
          <div className="font-medium mb-1">Schedule:</div>
          <ul className="list-disc ml-6">
            {course.schedule.map((slot, idx) => (
              <li key={idx} className="text-gray-600 text-sm">{slot.day}: {slot.startTime} - {slot.endTime}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default EnrolledCourseDetails;
