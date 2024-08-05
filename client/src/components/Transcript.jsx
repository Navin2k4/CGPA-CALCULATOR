import React, { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import { FaDownload } from 'react-icons/fa';
import ClipLoader from 'react-spinners/ClipLoader'
const yearMapping = {
    1: 'Ist Year',
    2: 'IInd Year',
    3: 'IIIrd Year',
    4: 'IVth Year'
};

function Transcript({ studentInfo, selectedCourses, courseGrades, gpa, cgpa, numSemesters }) {
    const downloadContainerRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const handleDownloadPDF = () => {
        setLoading(true);

        const element = downloadContainerRef.current;
        const fileName = `CGPA.pdf`;

        const opt = {
            margin: [0.3, 0.6],
            filename: fileName,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, logging: false },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };


        html2pdf().from(element).set(opt).save().then(() => {
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    };

    const renderCollegeInfo = () => (
        <div className="flex flex-col lg:flex-row justify-evenly items-center p-4 gap-4">
            <div>
                <img className="w-28 h-28 rounded-md" src="vcet.jpeg" alt="VCET Logo" />
            </div>
            <div className="text-center">
                <h1 className="text-xl font-bold">Velammal College of Engineering and Technology</h1>
                <h2 className="text-md">(Autonomous)</h2>
                <p className="text-md">Madurai – 625 009</p>
            </div>
        </div>
    );

    
    const renderSemesterGPA = () => (
        <div className="max-w-xl mx-auto my-4">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden p-4">
                <h2 className="text-[22px] font-semibold tracking-wider text-center mb-6">EACH SEMESTER GPA</h2>
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-[17px] border-b border-gray-200">
                            <th className="w-1/2 lg:w-1/4 py-2 text-center">Semesters</th>
                            <th className="w-1/2 lg:w-1/4 py-2 text-center">GPA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: numSemesters }, (_, semesterIndex) => (
                            <tr key={semesterIndex} className="border-b border-gray-200">
                                <td className="py-3 text-center">
                                    Semester {semesterIndex + 1}
                                </td>
                                <td className="py-3 text-center">
                                    {gpa[semesterIndex] !== undefined ? gpa[semesterIndex].toFixed(2) : ''}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="text-center m-4">
                    <h3 className="text-[24px] font-semibold ">
                        {cgpa !== null ? `CGPA : ${cgpa.toFixed(2)}` : ''}
                    </h3>
                </div>
            </div>
        </div>
    );

    const renderSemesterDetails = () => (
        <div className='py-6'>
            <div className="flex flex-col gap-4">
                {Array.from({ length: numSemesters }, (_, semesterIndex) => (
                    <div key={semesterIndex} className="bg-white shadow-md rounded-lg overflow-hidden py-6 page-break">
                        <h2 className="text-[20px] font-semibold text-center mb-6 tracking-wider">ACADEMIC GRADES FOR SEMESTER {semesterIndex + 1}</h2>
                        <div className="px-6 py-3 flex items-center justify-between bg-gray-100 border-b border-gray-200 pb-4">
                            <h3 className="text-lg md:text-xl lg:text-2xl font-semibold">
                                Semester {semesterIndex + 1}
                            </h3>
                            <h3 className="text-md lg:text-xl font-semibold  text-black rounded-lg">
                                {gpa[semesterIndex] !== undefined ? `GPA: ${gpa[semesterIndex].toFixed(2)}` : ''}
                            </h3>
                        </div>
                        <div className="px-6 py-2">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-[17px] border-b border-gray-200">
                                        <th className="w-1/6 lg:w-1/6 py-2 font-semibold">Course Code</th>
                                        <th className="w-1/3 lg:w-1/3 py-2 font-semibold">Course Title</th>
                                        <th className="w-1/5 lg:w-1/5 py-2 font-semibold text-center">Credits</th>
                                        <th className="w-1/5 lg:w-1/5 py-2 font-semibold text-center">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courseGrades[semesterIndex]?.map((course, courseIndex) => (
                                        <tr key={courseIndex} className="border-b border-gray-200">
                                            <td className="py-3 ">{course.course_code}</td>
                                            <td className="py-3 ">{course.course_name}</td>
                                            <td className="py-3  text-center">{course.course_credit}</td>
                                            <td className="py-3  text-center">{course.grade}</td>
                                        </tr>
                                    ))}
                                    {selectedCourses[semesterIndex]?.map((course, courseIndex) => (
                                        <tr key={courseIndex} className="border-b border-gray-200">
                                            <td className="py-3 ">{course.elective_code}</td>
                                            <td className="py-3 ">{course.elective_name}</td>
                                            <td className="py-3 text-center">{course.elective_credit}</td>
                                            <td className="py-3 text-center">{course.grade}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderDownloadBtn = () => {
        return (
            <div className="text-center mt-8">
                <button onClick={handleDownloadPDF}
                disabled={loading}
                className="mb-8 py-3 px-6 bg-blue-300 font-semibold rounded-lg ">
                    <div className='flex items-center justify-center gap-3'>
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="ml-2">Downloading...</span>
                                <ClipLoader color={"black"} loading={loading} size={24} speedMultiplier={0.3} />
                            </div>
                        ) : (
                            <>
                                <div>Download File</div>
                                <div><FaDownload /></div>
                            </>
                        )}
                    </div>
                </button>
            </div>
        );
    };


    return (
        <>
            <style jsx>{`
                .page-break 
                    { 
                    page-break-before: always; 
                    }
                .page-border {
                    border: 2px solid black; 
                    }`
            }</style>
            <div id='transcript-container' className="max-w-4xl pt-5 mx-auto font-sans text-base leading-normal">
                <div className="container mx-auto">
                    {renderSemesterGPA()}
                    {renderSemesterDetails()}
                </div>
            </div>
            <div className="hidden">
                <div ref={downloadContainerRef}>
                    <div className="first-page">
                        {renderCollegeInfo()}
                        {renderSemesterGPA()}
                    </div>
                    {renderSemesterDetails()}
                </div>
            </div>
            {renderDownloadBtn()}
        </>
    );
}

export default Transcript;