let express = require('express');
let router = express.Router();
let teacherService = require('../service/teacher');
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
 * @description - Get Teacher by id
 * @param - /teacher/profile
 */

router.get('/profile', (req, res) => {
    let id = req.body._id;
    teacherService.getTeacherData(id).then((data) => {
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
 * @description - Get Teacher courses
 * @param - /teacher/home
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
            teacherService.getMyCourses(id).then((courses) => {
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
 * @method - POST
 * @description - ADD Grade 
 * @param - /teacher/addgrade
 */
router.post(
    "/addgrade",
    [
        check("studentId", "Please Enter a Valid Student ID")
            .not()
            .isEmpty(),
        check("courseId", "Please Enter a Valid Course ID")
            .not()
            .isEmpty(),
        check("gradeType", "Please Enter a Valid Grade Type")
            .not()
            .isEmpty(),
        check("score", "Please Enter a Valid Grade")
            .not()
            .isEmpty(),


    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const grade = req.body;
        const studentId = grade.studentId;
        const courseId = grade.courseId;
        const gradeType = grade.gradeType;
        // const score=grade.score;

        try {
            let checkStudentId = await gradeModel.findOne({
                studentId: studentId
            });
            let checkCourseId = await gradeModel.findOne({
                courseId: courseId
            });
            let checkGradeType = await gradeModel.findOne({
                gradeType: gradeType
            });

            if (checkStudentId && checkCourseId && checkGradeType) {
                return res.status(400).json({
                    msg: "Grade Already Exists"
                });
            }
            else {
                teacherService.addGrade(grade).then((grade) => {
                    if (grade) {
                        res.json({ msg: 'Grade Added Successfuly' });
                    }
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({ msg: 'Internal Server Error' });
                })
            }
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Adding");
        }
    }
);
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
            teacherService.getCourseGrades(code).then((grades) => {
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
 * @description - Get grades for specific course
 * @param - /teacher/view/students/grades
 */
router.get('/view/students/grades', async (req, res) => {
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
            teacherService.getGradesForSpecificCourse(code).then((grades) => {
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
 * @description - Get students for specific course
 * @param - /teacher/view/course/students
 */
router.get('/view/course/students', async (req, res) => {
    let code = req.body.courseCode;
    try {
        // let checkforcourse = await studentModel.findOne({
        //     courses: code
        // });
        let checkforcourse = await teacherService.getStudentsInSpecificCourse(code);
        if (!checkforcourse) {
            return res.status(400).json({
                msg: "No Students In This Course Yet!"
            });
        }
        else {
            teacherService.getStudentsInSpecificCourse(code).then((students) => {
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
        res.status(500).send("Error in Saving");
    }
});

/**
 * @method - POST
 * @description - ADD Task 
 * @param - /teacher/addtask
 */
router.post(
    "/addtask",
    [
        check("courseId", "Please Enter a Valid Course ID")
            .not()
            .isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const taskbody = req.body;
        const courseId = req.body.courseId;
        const taskType = taskbody.tasks[0].type;
        const taskPath = taskbody.tasks[0].path;
        // const score=grade.score;
        try {
            let checkCourseId = await courseModel.findOne({
                courseCode: courseId
            });
            let checkfortask = await teacherService.searchfortask(courseId,taskType)

            if (!checkCourseId) {
                return res.status(400).json({
                    msg: "course Not Found"
                });
            }
            else if(checkfortask){
                return res.status(400).json({
                    msg: "this name of task was added before"
                });
            }
            else {
                
                teacherService.addCourseTask(courseId, taskType,taskPath).then((courseId) => {
                    if (courseId) {
                        res.json({ msg: 'Task Added Successfuly' });
                    }
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({ msg: 'Internal Server Error' });
                })
            }
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Adding");
        }
    }
);


/**
 * @method - DELETE
 * @description - Delete Task By name
 * @param - /teacher/deletetask
 */
router.delete('/deletetask', async (req, res) => {
    let code = req.body.courseCode;
    let taskname=req.body.taskname;
    try {
        let checkforcourse = await courseModel.findOne({
            courseCode: code
        });
        if (!checkforcourse) {
            return res.status(400).json({
                msg: "Course Not Found"
            });
        }
        else {
            teacherService.deleteCourseTask(code, taskname).then((task) => {
                if (task) {
                    res.status(201).json({ msg: 'Task Deleted Successfuly' });
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({ msg: "Internal Server Error" });
            });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Deleting");
    }
});

/**
 * @method - GET
 * @description - Get course tasks
 * @param - /teacher/view/course/tasks
 */

router.get('/view/course/taks', (req, res) => {
    let courseCode=req.body.courseCode;
    teacherService.viewCourserTasks(courseCode).then((data) => {
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