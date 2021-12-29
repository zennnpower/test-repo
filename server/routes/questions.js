const express = require("express")
const router = express.Router()
const fs = require("fs")
const {PythonShell} = require("python-shell")
const Question = require("../models/Question")
const User = require("../models/User")
const auth = require("../middleware/auth")
const {exec} = require("child_process")

// GET ALL QUESTIONS
router.get("/", async(req, res) => {
    try {
        let questions = await Question.find({})
        return res.json(questions)
    } catch(e) {
        return res.json({e, msg: "Something went wrong... We could not retreive the list of questions!"})
    }
})

// ADD QUESTION
router.post("/", auth, (req, res) => {
    try {
        let questionData = req.body
        if (questionData.title.replace(" ", "") < 1 || questionData.title === "undefined") return res.json({msg: "Please give a question title!"})
        if (questionData.description.replace(" ", "") < 1 || questionData.description === "undefined") return res.json({msg: "Please give a question description!"})
    
        const question = new Question({
            title: questionData.title,
            description: questionData.description,
            starter_code_py: questionData.starter_code_py,
            starter_code_js: questionData.starter_code_js,
            test_cases: JSON.parse(questionData.test_cases)
        })
        question.save()

        return res.json({msg: "Question uploaded!", question})
    } catch(e) {
        return res.json({msg: "Something went wrong... The question could not be uploaded!"})
    }
})

// GET SINGLE QUESTION
router.get("/:id", async(req, res) => {
    try {
        let question = await Question.findById(req.params.id)
        return res.json(question)
    } catch(e) {
        return res.json({msg: "The question does not exist!"})
    }
})

// EDIT QUESTION
router.put("/:id", auth, async(req, res) => {
    console.log(req.body)
    try {
        let question = await Question.findById(req.params.id)
        let updatedQuestion = req.body

        if (!question) {
            return res.json({msg: "No such question exists!"})
        }

        if (updatedQuestion.title.replace(" ", "") < 1 || updatedQuestion.title === "undefined") return res.json({msg: "Please give a question title!"})
        if (updatedQuestion.description.replace(" ", "") < 1 || updatedQuestion.description === "undefined") return res.json({msg: "Please give a question description!"})

        // await question.update({title: updatedQuestion.title, description: updatedQuestion.description, test_cases: updatedQuestion.test_cases})
        await Question.findOneAndUpdate({_id: req.params.id}, {title: updatedQuestion.title, description: updatedQuestion.description, starter_code_py: updatedQuestion.starter_code_py, starter_code_js: updatedQuestion.starter_code_js, test_cases: JSON.parse(updatedQuestion.test_cases)})

        return res.json({msg: "Question updated!"})
    } catch(e) {
        return res.json({msg: "Something went wrong... We could not update the question!"})
    }
})

// DELETE QUESTION
router.delete("/:id", auth, async(req, res) => {
    try {
        let question = await Question.findById(req.params.id);
        
        if (!question) {
            return res.json({msg: "No such post exists!"});
        }

        await question.remove();

        return res.json({msg: "Question deleted!"})
    } catch(e) {
        return res.json({msg: "Something went wrong... We could not delete the question!"})
    }
})

// CODE TESTING
router.post("/:id", auth, async (req, res) => {
    console.log(req.body)

    try {
        if (req.body.language === "python") {
            // let question = await Question.findOne({_id: req.params.id})
            let question = await Question.findOne({id: req.params.id})
            let questionId = question._id
            let userId = req.user.id
            let user = await User.findOne({id: userId})

            if (!question.users_attempted.includes(user._id)) {
                question.users_attempted.push(user._id)
                question.save()
            }
        
            let filePath = `./tests/Q-${questionId}-U-${userId}.py`
            
            fs.writeFileSync(filePath, req.body.code)
    
            let testCases = question.test_cases
            let tests = {}

            testCases.forEach(function(testCase, i) {
                tests = {...tests, [i]: testCase}
            })
    
            const promises = [];
            const testCaseResults = [];
          
            Object.keys(testCases).map((key) => {
                promises.push(
                    new Promise((resolve, reject) => {
                        PythonShell.run(
                            filePath,
                            {
                                mode: "text",
                                pythonOptions: ["-u"],
                                args: tests[key],
                            },
                            function (err, results) {
                                if (err) {
                                    reject();
                                    console.log(err)
                                }
                                console.log(results);
                                testCaseResults.push(results[0]);
                                resolve(true);
                            }
                        );
                    })
                );
            });

            let allTrue = (array) => {
                for(let i = 0; i < array.length; i++) {
                    if (!array[i]) return false
                }
                return true
            }

            Promise.all(promises).then(() => {
                if (allTrue(testCaseResults)) {
                    if (!question.users_completed.includes(user._id)) {
                        question.users_completed.push(user._id)
                        question.save()
                    }
                }
                res.json({ testCaseResults });
            });
        } else {
            // let question = await Question.findOne({_id: req.params.id})
            let question = await Question.findOne({id: req.params.id})
            let questionId = question._id
            let userId = req.user.id
            let user = await User.findOne({id: userId})

            if (!question.users_attempted.includes(user._id)) {
                question.users_attempted.push(user._id)
                question.save()
            }
        
            let filePath = `./tests/Q-${questionId}-U-${userId}.js`
            
            fs.writeFileSync(filePath, req.body.code)
    
            let testCases = question.test_cases
    
            const promises = [];
            const testCaseResults = [];
          
            Object.keys(testCases).map((key) => {
                promises.push(
                    new Promise((resolve, reject) => {
                        exec(`node ${filePath} ${[...testCases[key]]}`, (error, stdout, stderr) => {
                            if(error) {
                                reject()
                                console.log(error)
                            }
                            console.log(stdout)
                            testCaseResults.push(stdout)
                            resolve(true)
                        })
                    })
                );
            });

            let allTrue = (array) => {
                for(let i = 0; i < array.length; i++) {
                    if (!array[i]) return false
                }
                return true
            }

            Promise.all(promises).then(() => {
                if (allTrue(testCaseResults)) {
                    if (!question.users_completed.includes(user._id)) {
                        question.users_completed.push(user._id)
                        question.save()
                    }
                }
                // console.log(testCaseResults)
                res.json({ testCaseResults });
            });
        }
    } catch(e) {
        return res.json({msg: "Failed to test!"})
    }
})

module.exports = router;