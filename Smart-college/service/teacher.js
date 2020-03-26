const gradeModel = require('../module/grade');
const studentModel = require('../module/student');
const courseModel = require('../module/course');
const attendanceModel = require('../module/attendance');
const teacherModel = require('../module/teacher');

class teacherService {
    static getTeacherData(id) {
        return teacherModel.findOne({ _id: id });
    }

    static getMyCourses(id) {
        // _id: 1, name: 1, 
        return teacherModel.findOne({ _id: id }, { courses: 1, _id: 0 })
    }

    // ---
    static getCourseGrades(courseCode) {
        return courseModel.find({ courseCode: courseCode }, { 'grades.type': 1, 'grades.grade': 1, _id: 0 });
    }
    // ---
    static getGradesForSpecificCourse(courseCode) {
        return gradeModel.find({ courseId: courseCode });
    }

    static getStudentsInSpecificCourse(courseCode) {
        return studentModel.find({ courses: { $in: [courseCode] } }, { _id: 1, name: 1, });

    }
    static addGrade(grade) {
        let newGrade = new gradeModel(grade);
        return newGrade.save();
    }
    static addCourseTask(courseId, taskType, taskPath) {
        var task = { type: taskType, path: taskPath };
        return courseModel.findOne({ courseCode: courseId }).update(
            { courseCode: courseId }, // your query, usually match by _id
            { $push: { tasks: task } }, // item(s) to match from array you want to pull/remove
            { multi: true } // set this to true if you want to remove multiple elements.
        )
    }
    static deleteCourseTask(courseId, taskname) {
        return courseModel.findOne({ courseCode: courseId }).update(
            { courseCode: courseId }, // your query, usually match by _id
            { $pull: { tasks: { type: taskname } } }, // item(s) to match from array you want to pull/remove
            { multi: true } // set this to true if you want to remove multiple elements.
        )

    }
    static searchfortask(courseId, taskname) {
        return courseModel.findOne({ courseCode: courseId, 'tasks.type': { $in: taskname } })
    }
    static viewCourserTasks(courseId) {
        return courseModel.findOne({ courseCode: courseId }, { 'tasks': 1, _id: 0 })
    }
}
module.exports = teacherService;