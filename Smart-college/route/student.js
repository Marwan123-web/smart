let express = require('express');
let router = express.Router();
let studentService = require('../service/student');
const studentModel = require('../module/student');
const teacherModel = require('../module/teacher')
const gradeModel = require('../module/grade');
const courseModel = require('../module/course');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");


/**
 * @method - GET
 * @description - Get student by id
 * @param - /student/profile
 */

router.get('/profile', (req, res) => {
    let id = req.body._id;
    studentService.getStudentData(id).then((data) => {
        if (data) {
            res.json(data);
        }
        else {
            res.status(404).json({ msg: 'Your Data Not Found' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
});


/**
 * @method - GET
 * @description - Get student courses
 * @param - /student/home
 */
router.get('/home', async (req, res) => {
    let id = req.body._id;
    try {
        let checkforcourses = await teacherModel.findOne({
            courses: ''
        });
        if (checkforcourses) {
            return res.status(400).json({
                msg: "You Don't Teach any Course Yet"
            });
        }
        else {
            studentService.getMyCourses(id).then((courses) => {
                if (courses) {
                    res.json(courses);
                }
                else {
                    res.status(500).json({ msg: "No Courses For You" });
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({ msg: "Internal Server Error" });
            });
        }

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }

});
/**
 * @method - GET
 * @description - Get grades for specific course
 * @param - /student/view/course/grades
 */
router.get('/view/course/grades', async (req, res) => {
    let code = req.body.courseCode;
    try {
        let checkforcourse = await gradeModel.findOne({
            courseId: code
        });
        if (!checkforcourse) {
            return res.status(400).json({
                msg: "Course Not Found"
            });
        }
        else {
            studentService.getCourseGrades(code).then((grades) => {
                if (grades) {
                    res.json(grades);
                }
                else {
                    res.status(404).json({ msg: 'No Grades For This Course Yet' });
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({ msg: 'Internal Server Error' });
            })
        }

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
});




/**
 * @method - GET
 * @description - Get teacher for specific course
 * @param - /student/view/course/teachers
 */
router.get('/view/course/teachers', async (req, res) => {
    let code = req.body.courseCode;
    try {
        // let checkforcourse = await studentModel.findOne({
        //     courses: code
        // });
        let checkforcourse = await studentService.getTeachersInSpecificCourse(code);
        if (!checkforcourse) {
            return res.status(400).json({
                msg: "No Teacher In This Course Yet!"
            });
        }
        else {
            studentService.getTeachersInSpecificCourse(code).then((students) => {
                if (students) {
                    res.json(students);
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({ msg: "Internal Server Error" });
            });
        }

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in getting");
    }
});


/**
 * @method - GET
 * @description - Get course grades
 * @param - /student/view/course/mygrade
 */

router.get('/view/course/mygrade', (req, res) => {
    let id = req.body._id;
    let courseCode=req.body.courseCode;
    studentService.viewMyGrades(courseCode,id).then((data) => {
        if (data) {
            res.json(data);
        }
        else {
            res.status(404).json({ msg: 'Your Grades Not Found' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
});

/**
 * @method - GET
 * @description - Get course tasks
 * @param - /student/view/course/tasks
 */

router.get('/view/course/tasks', (req, res) => {
    let id = req.body._id;
    let courseCode=req.body.courseCode;
    studentService.viewCourserTasks(courseCode).then((data) => {
        if (data) {
            res.json(data);
        }
        else {
            res.status(404).json({ msg: 'No Tasks Yet' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
});
module.exports = router;