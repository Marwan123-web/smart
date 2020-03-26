let express = require('express');
let router = express.Router();
let adminService = require('../service/admin');
const studentModel = require('../module/student');
const teacherModel = require('../module/teacher')
const gradeModel = require('../module/grade');
const courseModel = require('../module/course');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");

// ------------------------Student Routes ----------------------------------------
/**
 * @method - GET
 * @description - Get All Students
 * @param - /admin/view/students
 */

router.get('/view/students', (req, res) => {
    adminService.getAllStudents().then((students) => {
        if (students) {
            res.json(students);
        }
        else {
            res.status(404).json({ msg: 'No Students Yet' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
});

/**
 * @method - GET
 * @description - Get Student by id
 * @param - /admin/view/studentbyid
 */

router.get('/view/studentbyid', (req, res) => {
    let id = req.body._id;
    adminService.getStudentById(id).then((student) => {
        if (student) {
            res.json(student);
        }
        else {
            res.status(404).json({ msg: 'Student Not Found' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
});

/**
 * @method - GET
 * @description - Get Student by name
 * @param - /admin/view/studentbyname
 */

router.get('/view/studentbyname', (req, res) => {
    let name = req.body.name;
    adminService.getStudentByName(name).then((student) => {
        if (student) {
            res.json(student);
        }
        else {
            res.status(404).json({ msg: 'Student Not Found' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
});


/**
 * @method - POST
 * @description - Add New Student
 * @param - /admin/addstudent
 */
router.post(
    "/addstudent",
    [
        check("_id", "Please Enter a Valid ID")
            .not()
            .isEmpty(),
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: 8
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const student = req.body;
        email = student.email;
        id = req.body._id;
        course = req.body.courses;
        try {
            let checkforid = await studentModel.findOne({
                _id: id
            });
            let checkforemail = await studentModel.findOne({
                email
            });
            let checkforcourse = await courseModel.findOne({
                courseCode: course
            });
            if (checkforid || checkforemail) {
                return res.status(400).json({
                    msg: "User Already Exists"
                });
            }
            else if (!checkforcourse) {
                return res.status(400).json({
                    msg: "Course Not Found"
                });
            }
            else {
                adminService.addStudent(student).then((student) => {
                    if (student) {
                        res.json({ msg: 'Student Added Successfuly' });
                    }
                    else {
                        res.status(404).json({ msg: "Can't Add This Students" });
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
    }
);




/**
 * @method - PUT
 * @description - Update Student By Id
 * @param - /admin/updatestudent
 */
router.put('/updatestudent', (req, res) => {
    let id = req.body._id;
    studentModel.findOneAndUpdate({ _id: id },
        req.body,
        { useFindAndModify: false },
        (err) => {
            if (err) {
                res.status(404).json({ msg: "Can't Update this Student Information" });
            }
            res.status(201).json({ msg: "Student's Information Updated Successfuly" });
        });
});

/**
 * @method - DELETE
 * @description - Delete Student By Id
 * @param - /admin/deletestudent
 */
router.delete('/deletestudent', async (req, res) => {
    let id = req.body._id;
    try {
        let checkforstudent = await studentModel.findOne({
            _id: id
        });
        if (!checkforstudent) {
            return res.status(400).json({
                msg: "Student Not Found"
            });
        }
        else {
            adminService.deleteStudent(id).then((student) => {
                if (student) {
                    res.status(201).json({ msg: 'Student Deleted Successfuly' });
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
 * @method - DELETE
 * @description - delete course for student
 * @param - /admin/delete/student/course
 */
router.delete('/delete/student/course', async (req, res) => {
    let courseCode = req.body.courseCode;
    let id = req.body._id;
    try {
        let checkforstudent = await studentModel.findOne({
            _id: id
        });
        let checkforcourse = await studentModel.findOne({
            courses: courseCode
        });
        if (!checkforstudent) {
            return res.status(400).json({
                msg: "Student Not Found"
            });
        }
        else if (!checkforcourse) {
            return res.status(400).json({
                msg: "Course Not Found"
            });
        } else {
            adminService.deleteCourseForStudent(id, courseCode).then((course) => {
                if (course) {
                    res.status(201).json({ msg: 'Course Deleted Successfuly from this Student' });
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
 * @description - Get Student courses
 * @param - /admin/view/student/courses
 */
router.get('/view/student/courses', async (req, res) => {
    let id = req.body._id;
    try {
        let checkforstudent = await studentModel.findOne({
            _id: id
        });
        if (!checkforstudent) {
            return res.status(400).json({
                msg: "Student Not Found"
            });
        }
        else {
            adminService.getStudentCourses(id).then((courses) => {
                if (courses) {
                    res.json(courses);
                }
                else {
                    res.status(500).json({ msg: "No Courses For This Student" });
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


// ------------------------Teacher Routes ----------------------------------------
/**
 * @method - GET
 * @description - Get All Teachers
 * @param - /admin/view/teachers
 */

router.get('/view/teachers', (req, res) => {
    adminService.getAllTeachers().then((teachers) => {
        if (teachers) {
            res.json(teachers);
        }
        else {
            res.status(404).json({ msg: 'No Teachers Yet' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
});

/**
 * @method - GET
 * @description - Get Teacher by id
 * @param - /admin/view/teacherbyid
 */

router.get('/view/teacherbyid', (req, res) => {
    let id = req.body._id;
    adminService.getTeacherById(id).then((teacher) => {
        if (teacher) {
            res.json(teacher);
        }
        else {
            res.status(404).json({ msg: 'Teacher Not Found' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
});

/**
 * @method - GET
 * @description - Get Teacher by name
 * @param - /admin/view/teacherbyname
 */

router.get('/view/teacherbyname', (req, res) => {
    let name = req.body.name;
    adminService.getTeacherByName(name).then((teacher) => {
        if (teacher) {
            res.json(teacher);
        }
        else {
            res.status(404).json({ msg: 'Teacher Not Found' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
});


/**
 * @method - POST
 * @description - Add New Teacher
 * @param - /admin/addteacher
 */
router.post(
    "/addteacher",
    [
        check("_id", "Please Enter a Valid ID")
            .not()
            .isEmpty(),
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: 8
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const teacher = req.body;
        email = teacher.email;
        id = req.body._id;
        try {
            let user = await teacherModel.findOne({
                _id: id
            });
            let user2 = await teacherModel.findOne({
                email
            });
            if (user || user2) {
                return res.status(400).json({
                    msg: "User Already Exists"
                });
            }
            else {
                adminService.addTeacher(teacher).then((teacher) => {
                    if (teacher) {
                        res.json({ msg: 'Teacher Added Successfuly' });
                    }
                    else {
                        res.status(404).json({ msg: 'Teacher Not Found' });
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
    }
);




/**
 * @method - PUT
 * @description - Update Teacher By Id
 * @param - /admin/updateteacher
 */
router.put('/updateteacher', (req, res) => {
    let id = req.body._id;
    teacherModel.findOneAndUpdate({ _id: id },
        req.body,
        { useFindAndModify: false },
        (err) => {
            if (err) {
                res.status(404).json({ msg: "Can't Update this Teacher Information" });
            }
            res.status(201).json({ msg: "Teacher's Information Updated Successfuly" });
        });
});

/**
 * @method - DELETE
 * @description - Delete Teacher By Id
 * @param - /admin/deleteteacher
 */
router.delete('/deleteteacher', async (req, res) => {
    let id = req.body._id;
    try {
        let checkforteacher = await teacherModel.findOne({
            _id: id
        });
        if (!checkforteacher) {
            return res.status(400).json({
                msg: "Teacher Not Found"
            });
        }
        else {
            adminService.deleteTeacher(id).then((teacher) => {
                if (teacher) {
                    res.status(201).json({ msg: 'Teacher Deleted Successfuly' });
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
 * @method - DELETE
 * @description - delete course for teacher
 * @param - /admin/delete/teacher/course
 */
router.delete('/delete/teacher/course', async (req, res) => {
    let courseCode = req.body.courseCode;
    let id = req.body._id;
    try {
        let checkforteacher = await teacherModel.findOne({
            _id: id
        });
        let checkforcourse = await teacherModel.findOne({
            courses: courseCode
        });
        if (!checkforteacher) {
            return res.status(400).json({
                msg: "Teacher Not Found"
            });
        }
        else if (!checkforcourse) {
            return res.status(400).json({
                msg: "Course Not Found"
            });
        } else {
            adminService.deleteCourseForTeacher(id, courseCode).then((course) => {
                if (course) {
                    res.status(201).json({ msg: 'Course Deleted Successfuly from this Teacher' });
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
 * @description - Get Teacher courses
 * @param - /admin/view/teacher/courses
 */
router.get('/view/teacher/courses', async (req, res) => {
    let id = req.body._id;
    try {
        let checkforteacher = await teacherModel.findOne({
            _id: id
        });
        if (!checkforteacher) {
            return res.status(400).json({
                msg: "Teacher Not Found"
            });
        }
        else {
            adminService.getTeacherCourses(id).then((courses) => {
                if (courses) {
                    res.json(courses);
                }
                else {
                    res.status(500).json({ msg: "No Courses For This Teacher" });
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



// ------------------------Course Routes ----------------------------------------
/**
 * @method - GET
 * @description - Get All Courses
 * @param - /admin/view/courses
 */

router.get('/view/courses', (req, res) => {
    adminService.getAllCourses().then((courses) => {
        if (courses) {
            res.json(courses);
        }
        else {
            res.status(404).json({ msg: 'No Courses Yet' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
});

/**
 * @method - GET
 * @description - Get Course by code
 * @param - /admin/view/coursebyid
 */

router.get('/view/coursebyid', (req, res) => {
    let code = req.body.courseCode;
    adminService.getCourseByCode(code).then((course) => {
        if (course) {
            res.json(course);
        }
        else {
            res.status(404).json({ msg: 'Student Not Found' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
});

/**
 * @method - GET
 * @description - Get Course by name
 * @param - /admin/view/coursebyname
 */

router.get('/view/coursebyname', (req, res) => {
    let name = req.body.courseName;
    adminService.getCourseByName(name).then((course) => {
        if (course) {
            res.json(course);
        }
        else {
            res.status(404).json({ msg: 'Course Not Found' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
});

/**
 * @method - POST
 * @description - Add New Course
 * @param - /admin/addcourse
 */
router.post(
    "/addcourse",
    [
        check("courseCode", "Please Enter a Valid Code")
            .not()
            .isEmpty(),
        check("courseName", "Please Enter a Valid Name")
            .not()
            .isEmpty(),
        check("courseDepartment", "Please Enter a Valid Department")
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
        const course = req.body;
        code = course.courseCode;
        name = req.body.courseName;
        try {
            let user = await courseModel.findOne({
                courseCode: code
            });
            let user2 = await courseModel.findOne({
                courseName: name
            });
            if (user || user2) {
                return res.status(400).json({
                    msg: "Course Already Exists"
                });
            }
            else {
                adminService.addCourse(course).then((course) => {
                    if (course) {
                        res.json({ msg: 'Course Added Successfuly' });
                    }
                    else {
                        res.status(404).json({ msg: "Can't add this Course" });
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
    }
);




/**
 * @method - PUT
 * @description - Update Course By Course Code
 * @param - /admin/updatecourse
 */
router.put('/updatecourse', async (req, res) => {
    let code = req.body.courseCode;
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
            courseModel.findOneAndUpdate({ courseCode: code },
                req.body,
                { useFindAndModify: false },
                (err) => {
                    if (err) {
                        res.status(404).json({ msg: "Can't Update this Course Information" });
                    }
                    res.status(201).json({ msg: "Course's Information Updated Successfuly" });
                });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in updating");
    }
});

/**
 * @method - DELETE
 * @description - Delete Course By Id
 * @param - /admin/deletecourse
 */
router.delete('/deletecourse', async (req, res) => {
    let code = req.body.courseCode;
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
            adminService.deleteCourse(code).then((course) => {
                if (course) {
                    res.status(201).json({ msg: 'Course Deleted Successfuly' });
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
 * @description - Get Students in specific course
 * @param - /admin/view/course/students
 */
router.get('/view/course/students', async (req, res) => {
    let code = req.body.courseCode;
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
            adminService.getStudentsInSpecificCourse(code).then((students) => {
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
 * @method - GET
 * @description - Get Teachers in specific course
 * @param - /admin/view/course/teachers
 */
router.get('/view/course/teachers', async (req, res) => {
    let code = req.body.courseCode;
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
            adminService.getTeacherInSpecificCourse(code).then((teachers) => {
                if (teachers) {
                    res.json(teachers);
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({ msg: "Internal Server Error" });
            });
        }

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Searching");
    }
});

// ------------------------Grade Route-----------------------

/**
 * @method - POST
 * @description - ADD Grade 
 * @param - /admin/addgrade
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
                adminService.addGrade(grade).then((grade) => {
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
 * @param - /admin/view/course/grades
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
            adminService.getGradesForSpecificCourse(code).then((grades) => {
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
 * @method - PUT
 * @description - update grades for specific course to student
 * @param - /admin/update/student/grade
 */
router.put('/update/student/grade', async (req, res) => {
    let courseId = req.body.courseId;
    let studentId = req.body.studentId;
    let gradeType = req.body.gradeType;
    try {
        let checkStudentId = await gradeModel.findOne({
            studentId: studentId
        });
        let checkCourseId = await gradeModel.findOne({
            courseId: courseId
        });
        let checkGradeType = await gradeModel.findOne({
            gradeType: gradeType, studentId: studentId, courseId: courseId
        });

        if (!checkCourseId || !checkStudentId || !checkGradeType) {
            return res.status(400).json({
                msg: "Something is wrong in you data"
            });
        }
        else {
            gradeModel.findOneAndUpdate({ studentId, courseId, gradeType },
                req.body,
                { useFindAndModify: false },
                (err) => {
                    if (err) {
                        res.status(404).json({ msg: "Can't Update this Student's Grade Information" });
                    }
                    res.status(201).json({ msg: "Student's Grade Updated Successfuly" });
                });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in updating");
    }

});



module.exports = router;