const gradeModel = require('../module/grade');
const studentModel = require('../module/student');
const courseModel = require('../module/course');
const attendanceModel = require('../module/attendance');
const teacherModel = require('../module/teacher');

class studentService {
    static getStudentData(id) {
        return studentModel.findOne({ _id: id });
    }

    static getMyCourses(id) {
        // _id: 1, name: 1, 
        return studentModel.findOne({ _id: id }, { courses: 1, _id: 0 })
    }
    static getCourseGrades(courseCode) {
        return courseModel.find({ courseCode: courseCode }, { 'grades.type': 1, 'grades.grade': 1, _id: 0 });
    }

    static getTeachersInSpecificCourse(courseCode) {
        return teacherModel.find({ courses: { $in: [courseCode] } }, { _id: 0, name: 1, });

    }
    static viewMyGrades(courseCode, studentId) {
        return gradeModel.find({ studentId: studentId, courseId: courseCode });
    }
    static viewCourserTasks(courseId) {
        return courseModel.findOne({ courseCode: courseId }, { 'tasks': 1, _id: 0 })
    }
}
module.exports = studentService;