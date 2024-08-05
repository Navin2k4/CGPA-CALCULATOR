import { useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Alert } from "flowbite-react";
import {
  useFetchDepartments,
  useFetchSemesters,
  useFetchVerticals,
} from "./useFetchData";
import { Select, FloatingLabel } from "flowbite-react";
import Transcript from "../components/Transcript";
const gradeScale = { O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, U: 0 };
const StudentData = () => {
  const departments = useFetchDepartments();
  const initialNumSemesters =
    parseInt(localStorage.getItem("numSemesters")) || 0;
  const initialNumElectivesPerSemester =
    JSON.parse(localStorage.getItem("numElectivesPerSemester")) ||
    Array.from({ length: 8 }, () => 0);
  const initialCourseGrades =
    JSON.parse(localStorage.getItem("courseGrades")) || [];
  const [numSemesters, setNumSemesters] = useState(initialNumSemesters);
  const [departmentAcronym, setDepartmentAcronym] = useState("");
  const semesters = useFetchSemesters(departmentAcronym);
  const electives = useFetchVerticals(departmentAcronym);
  const [numElectivesPerSemester, setNumElectivesPerSemester] = useState(
    initialNumElectivesPerSemester
  );
  const [selectedCourses, setSelectedCourses] = useState(
    Array.from({ length: 8 }, () => [])
  );
  const [selectedElectives, setSelectedElectives] = useState(new Set());
  const [courseGrades, setCourseGrades] = useState(initialCourseGrades);
  const [gpa, setGpa] = useState([]);
  const [cgpa, setCgpa] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const semesterData = semesters.find(
    (semester) => semester.department_acronym === departmentAcronym
  );
  const electiveData = electives.find(
    (elective) => elective.department_acronym === departmentAcronym
  );
  const [studentInfo, setStudentInfo] = useState({
    departmentAcronym: "",
    batch: "",
    year: "",
    section: "",
  });
  const [prevArrear, setprevArrear] = useState(() => {
    const arrears = courseGrades.flatMap((semesterCourses) =>
      semesterCourses.filter((course) => course.grade === "U")
    );
    return arrears;
  });
  useEffect(() => {
    const arrears = courseGrades.flatMap((semesterCourses) =>
      semesterCourses.filter((course) => course.grade === "U")
    );
    setprevArrear(arrears);
  }, [courseGrades]);

  useEffect(() => {
    if (studentInfo && studentInfo.department) {
      const acronym = studentInfo.department.split(" - ")[0];
      setDepartmentAcronym(acronym);
    }
  }, [studentInfo]);
  useEffect(() => {
    const savedStudentInfo = JSON.parse(localStorage.getItem('studentInfo'));
    if (savedStudentInfo) {
        setStudentInfo(savedStudentInfo);
    }
}, []);
  useEffect(() => {
    const updatedCourseGrades = courseGrades.slice(0, numSemesters);
    setCourseGrades(updatedCourseGrades);
    localStorage.setItem("courseGrades", JSON.stringify(updatedCourseGrades));
    const storedStudentInfo = JSON.parse(localStorage.getItem('studentInfo'));
  }, [numSemesters]);

  useEffect(() => {
    localStorage.setItem("numSemesters", numSemesters.toString());
    localStorage.setItem(
      "numElectivesPerSemester",
      JSON.stringify(numElectivesPerSemester)
    );
    localStorage.setItem("courseGrades", JSON.stringify(courseGrades));
  }, [numSemesters, selectedCourses, courseGrades, numElectivesPerSemester]);

  const handleNumSemestersChange = (event) => {
    setShowTranscript(false);
    const value = Number(event.target.value);
    if (value >= 0 && value <= 8) {
      const updatedSelectedCourses = selectedCourses.slice(0, value);
      const updatedCourseGrades = courseGrades.slice(0, value);
      if (value < numSemesters) {
        updatedSelectedCourses.splice(value);
        updatedCourseGrades.splice(value);
      }
      setNumSemesters(value);
      setSelectedCourses(updatedSelectedCourses);
      setCourseGrades(updatedCourseGrades);
    }
  };

  const handleCourseSelect = (event, semesterIndex, electiveIndex) => {
    setShowTranscript(false);
    const selectedCourseValue = event.target.value;
    const updatedSelectedCourses = [...selectedCourses];
    const updatedSelectedElectives = new Set(selectedElectives);
    const previousCourse = updatedSelectedCourses[semesterIndex][electiveIndex];
    if (previousCourse) {
      updatedSelectedElectives.delete(previousCourse.elective_code);
    }
    if (selectedCourseValue === "") {
      updatedSelectedCourses[semesterIndex][electiveIndex] = {
        elective_name: "",
        elective_code: "",
        elective_credit: "",
        grade: "",
      };
    } else {
      const electiveCourse = electiveData?.verticals
        .flatMap((vertical) => vertical.courses)
        .find(
          (course) =>
            `${course.elective_name} (${course.elective_code})` ===
            selectedCourseValue
        );
      if (electiveCourse) {
        updatedSelectedElectives.add(electiveCourse.elective_code);
        updatedSelectedCourses[semesterIndex][electiveIndex] = {
          elective_name: electiveCourse.elective_name,
          elective_code: electiveCourse.elective_code,
          elective_credit: electiveCourse.elective_credit,
          grade: "",
        };
      }
    }
    setSelectedCourses(updatedSelectedCourses);
    setSelectedElectives(updatedSelectedElectives);
  };

  const handleGradeSelect = (event, semesterIndex, courseIndex) => {
    setShowTranscript(false);
    const selectedGrade = event.target.value;
    const updatedCourseGrades = [...courseGrades];
    const course = semesterData.semesters[semesterIndex].courses[courseIndex];
    const gradeData = {
      course_name: course.course_name,
      course_code: course.course_code,
      course_credit: course.course_credits,
      grade: selectedGrade,
      semesterIndex: semesterIndex,
      courseIndex: courseIndex,
    };
    if (!updatedCourseGrades[semesterIndex]) {
      updatedCourseGrades[semesterIndex] = [];
    }
    updatedCourseGrades[semesterIndex][courseIndex] = gradeData;
    setCourseGrades(updatedCourseGrades);
  };

  const handleElectiveGradeSelect = (event, semesterIndex, electiveIndex) => {
    setShowTranscript(false);
    const selectedGrade = event.target.value;
    const updatedSelectedCourses = [...selectedCourses];
    updatedSelectedCourses[semesterIndex][electiveIndex].grade = selectedGrade;
    setSelectedCourses(updatedSelectedCourses);
  };

  const handleChangeNumElectives = (event, index) => {
    setShowTranscript(false);
    const newValue = parseInt(event.target.value);
    const updatedNumElectivesPerSemester = [...numElectivesPerSemester];
    const updatedSelectedCourses = [...selectedCourses];
    const updatedSelectedElectives = new Set(selectedElectives);
    if (newValue < numElectivesPerSemester[index]) {
      for (let i = newValue; i < numElectivesPerSemester[index]; i++) {
        const courseToRemove = updatedSelectedCourses[index][i];
        if (courseToRemove) {
          updatedSelectedElectives.delete(courseToRemove.elective_code);
        }
      }
      updatedSelectedCourses[index] = updatedSelectedCourses[index].slice(
        0,
        newValue
      );
    }
    updatedNumElectivesPerSemester[index] = newValue;
    setNumElectivesPerSemester(updatedNumElectivesPerSemester);
    setSelectedCourses(updatedSelectedCourses);
    setSelectedElectives(updatedSelectedElectives);
  };

  const incrementNumElectives = (index) => {
    setShowTranscript(false);
    const updatedNumElectives = [...numElectivesPerSemester];
    updatedNumElectives[index] += 1;
    setNumElectivesPerSemester(updatedNumElectives);
  };

  const decrementNumElectives = (index) => {
    setShowTranscript(false);
    if (numElectivesPerSemester[index] > 0) {
      const updatedNumElectives = [...numElectivesPerSemester];
      const updatedSelectedCourses = [...selectedCourses];
      const updatedSelectedElectives = new Set(selectedElectives);
      const lastSelectedIndex = updatedSelectedCourses[index].length - 1;
      if (lastSelectedIndex >= 0) {
        const lastElective = updatedSelectedCourses[index][lastSelectedIndex];
        updatedSelectedElectives.delete(lastElective.elective_code);
        updatedSelectedCourses[index].splice(lastSelectedIndex, 1);
      }
      updatedNumElectives[index] -= 1;
      setNumElectivesPerSemester(updatedNumElectives);
      setSelectedCourses(updatedSelectedCourses);
      setSelectedElectives(updatedSelectedElectives);
    }
  };

  const handleSubmit = (event) => {
    setShowTranscript(false);
    event.preventDefault();
    let totalCredits = 0;
    let totalMarks = 0;
    const newGpa = [];
    for (
      let semesterIndex = 0;
      semesterIndex < Math.min(selectedCourses.length, courseGrades.length);
      semesterIndex++
    ) {
      let semesterTotalCredits = 0;
      let semesterTotalMarks = 0;

      selectedCourses[semesterIndex].forEach((course) => {
        const grade = course.grade;
        const credits = parseFloat(course.elective_credit);
        semesterTotalMarks += gradeScale[grade] * credits;
        semesterTotalCredits += credits;
      });

      courseGrades[semesterIndex].forEach((gradeData) => {
        const grade = gradeData.grade;
        const credits = parseFloat(gradeData.course_credit);
        semesterTotalMarks += gradeScale[grade] * credits;
        semesterTotalCredits += credits;
      });
      if (semesterTotalCredits > 0) {
        const semesterGpa = semesterTotalMarks / semesterTotalCredits;
        newGpa.push(semesterGpa);
      } else {
        newGpa.push(0);
      }

      totalMarks += semesterTotalMarks;
      totalCredits += semesterTotalCredits;
    }
    const currentCgpa = totalCredits > 0 ? totalMarks / totalCredits : 0;
    setGpa(newGpa);
    setCgpa(currentCgpa);
    setShowTranscript(true);
  };

  const handleStudentInfoChange = (event) => {
    const { name, value } = event.target;
    if (name === "department" && value === "") {
      setStudentInfo({ departmentAcronym: "" });
      setShowAlert(false);
    } else {
      const capitalizedValue =
        name !== "department" ? value.toUpperCase() : value;
      setStudentInfo((prevStudentInfo) => {
        const updatedInfo = {
          ...prevStudentInfo,
          [name]: capitalizedValue,
        };
        if (name === "department") {
          const acronym = value.split(" - ")[0];
          updatedInfo.departmentAcronym = acronym;
        }
        return updatedInfo;
      });
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 md:p-10 min-h-screen">
      <div className="bg-white px-2 md:px-6 py-8 rounded-lg shadow-lg w-full max-w-5xl">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <h1 className="text-xl font-semibold">Select Department</h1>
        <Select
          className="tracking-wider  bg-gray-100 rounded-md border border-gray-300"
          value={studentInfo.department}
          onChange={handleStudentInfoChange}
          name="department"
          required
        >
          <option value="">Select Department</option>
          {departments.map((department) => (
            <option
              key={department._id}
              value={`${department.department_acronym} - ${department.department_name}`}
            >
              {`${department.department_name} (${department.department_acronym})`}
            </option>
          ))}
        </Select>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-4 mt-2">
            <Alert
              color="blue"
              className="w-full lg:w-1/3 text-black text-md text-center"
            >
              Select number of semesters
            </Alert>
            <div className="flex flex-row items-center gap-4">
              <button
                type="button"
                className="px-4 py-2 bg-blue-300 text-white font-bold hover:bg-blue-400 rounded-md transition-all duration-300"
                onClick={() => setNumSemesters((prev) => Math.max(prev - 1, 0))}
              >
                -
              </button>
              <div className="w-24">
                <FloatingLabel
                  className="text-center text-gray-800 font-semibold"
                  variant="standard"
                  type="number"
                  value={numSemesters}
                  onChange={handleNumSemestersChange}
                  required
                  disabled
                  style={{ textAlign: "center" }}
                />
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-blue-300 text-white hover:bg-blue-400 rounded-md transition-all duration-300"
                onClick={() => setNumSemesters((prev) => Math.min(prev + 1, 8))}
              >
                +
              </button>
            </div>
          </div>

          {Array.from({ length: numSemesters }, (_, index) => (
            <div
              key={`semester_${index}`}
              className="w-full bg-white rounded-lg shadow-md px-4 mb-8"
            >
              <h3 className="text-xl md:text-2xl font-semibold  text-gray-800 mb-4">
                SEMESTER {index + 1} - {index % 2 === 0 ? "ODD" : "EVEN"}
              </h3>
              {semesterData && (
                <div className="bg-gray-800 text-gray-100 p-4 rounded-md shadow-md">
                  <div className="flex flex-col w-full">
                    {semesterData.semesters[index]?.courses.map(
                      (course, courseIndex) => (
                        <div
                          key={`course_${courseIndex}`}
                          className="flex flex-col lg:flex-row items-center border-b border-gray-600 py-2"
                        >
                          <div className="w-full py-1 md:py-2">
                            <p className="text-md">{course.course_name}</p>
                          </div>
                          <div className="flex w-full items-center gap-4">
                            <div className="w-1/2 lg:w-1/3">
                              <p className="text-sm">{course.course_code}</p>
                            </div>
                            <div className="w-1/2 lg:w-1/3">
                              <p className="text-sm">
                                {course.course_credits.toString()}
                              </p>
                            </div>
                            <div className="w-1/2 lg:w-1/3">
                              <Select
                                required
                                value={
                                  courseGrades[index]?.[courseIndex]?.grade ||
                                  ""
                                }
                                onChange={(event) =>
                                  handleGradeSelect(event, index, courseIndex)
                                }
                                className="bg-gray-700 border border-gray-600 text-gray-100 rounded-md text-sm"
                              >
                                <option value="">Grade</option>
                                {Object.keys(gradeScale).map((grade) => (
                                  <option key={grade} value={grade}>
                                    {grade}
                                  </option>
                                ))}
                              </Select>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
              {index >= 4 && electiveData && (
                <div className="px-4 py-6 bg-orange-200 rounded-lg shadow-md">
                  <div className="flex flex-row items-center gap-4 mb-4">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                      Select Number of Electives
                    </h3>
                    <button
                      type="button"
                      className="px-4 py-2 bg-orange-300 text-gray-800 font-bold hover:bg-orange-400 rounded-md transition-all duration-300"
                      onClick={() => decrementNumElectives(index)}
                    >
                      -
                    </button>
                    <div className="w-24">
                      <FloatingLabel
                        className="text-center text-gray-800 font-semibold"
                        variant="standard"
                        label=""
                        min="0"
                        type="number"
                        value={
                          numElectivesPerSemester[index] === 0
                            ? "0"
                            : numElectivesPerSemester[index]
                        }
                        onChange={(event) =>
                          handleChangeNumElectives(event, index)
                        }
                        required
                        disabled
                      />
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-orange-300 text-gray-800 hover:bg-orange-400 rounded-md transition-all duration-300"
                      onClick={() => incrementNumElectives(index)}
                    >
                      +
                    </button>
                  </div>
                  {[...Array(numElectivesPerSemester[index])].map(
                    (_, electiveIndex) => (
                      <div
                        key={`elective_${electiveIndex}`}
                        className="flex flex-col lg:flex-row gap-4 items-center  rounded-md shadow-sm py-2"
                      >
                        <div className="w-full">
                          <Select
                            required
                            defaultValue=""
                            onChange={(event) =>
                              handleCourseSelect(event, index, electiveIndex)
                            }
                            className="bg-gray-100 text-gray-800 border border-gray-300 rounded-md"
                          >
                            <option value="">Select Vertical</option>
                            {electiveData.verticals.map((vertical) => (
                              <optgroup
                                key={vertical._id}
                                label={`VERTICAL ${vertical.vertical_number} - ${vertical.vertical_name}`}
                              >
                                {vertical.courses.map((course) => {
                                  const courseValue = `${course.elective_name} (${course.elective_code})`;
                                  const isCourseSelected =
                                    selectedElectives.has(course.elective_code);
                                  return (
                                    <option
                                      key={course._id}
                                      value={courseValue}
                                      disabled={isCourseSelected}
                                    >
                                      {isCourseSelected
                                        ? `${course.elective_name}`
                                        : `${course.elective_code} - ${course.elective_name}`}
                                    </option>
                                  );
                                })}
                              </optgroup>
                            ))}
                          </Select>
                        </div>
                        <div className="flex w-full items-center gap-4">
                          <div className="w-1/2 lg:w-1/3">
                            <p className="text-gray-800">
                              {selectedCourses[index]?.[electiveIndex]
                                ?.elective_code || ""}
                            </p>
                          </div>
                          <div className="w-1/2 lg:w-1/3">
                            <p className="text-gray-800">
                              {selectedCourses[index]?.[electiveIndex]
                                ?.elective_credit || ""}
                            </p>
                          </div>
                          <div className="w-1/2 lg:w-1/3">
                            <Select
                              required
                              onChange={(event) =>
                                handleElectiveGradeSelect(
                                  event,
                                  index,
                                  electiveIndex
                                )
                              }
                              className="bg-gray-100 text-gray-800 border border-gray-300 rounded-md"
                            >
                              <option value="">Grade</option>
                              {Object.keys(gradeScale).map((grade) => (
                                <option key={grade} value={grade}>
                                  {grade}
                                </option>
                              ))}
                            </Select>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
          <div className="flex flex-col-reverse sm:flex-row justify-between mt-6">
            <div className="bg-blue-300 text-center p-4 m-2 text-base sm:text-lg rounded-lg font-semibold shadow-md text-gray-900 flex items-center justify-center">
              <span className="mr-2">Your CGPA:</span>
              <span className="text-lg sm:text-2xl text-blue-900">
                {cgpa ? parseFloat(cgpa).toFixed(2) : "-"}
              </span>
            </div>
            <button
              type="submit"
              className={`text-center p-4 m-2 text-base sm:text-lg rounded-lg font-semibold shadow-md transition-all duration-300 ${
                numSemesters === 0
                  ? "bg-slate-100 cursor-not-allowed text-gray-500"
                  : "bg-blue-300 hover:bg-blue-400 hover:shadow-lg"
              }`}
              disabled={numSemesters === 0}
            >
              Calculate CGPA
            </button>
          </div>
        </form>
        <div>
          {showTranscript && (
            <Transcript
              studentInfo={studentInfo}
              courseGrades={courseGrades}
              selectedCourses={selectedCourses}
              gpa={gpa}
              cgpa={cgpa}
              numSemesters={numSemesters}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default StudentData;
