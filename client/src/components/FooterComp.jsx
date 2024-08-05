const FooterComp = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-800 text-white py-6 px-4">
            <div className="container mx-auto text-center">
                <div className="flex flex-col items-center space-y-2">
                    <p className="text-[14px]">Velemmal College of Engineering and Technology, Madurai</p>
                    <p className="text-[14px]">Department of Computer Science and Engineering</p>
                    <hr className="w-1/2 my-4 border-gray-700" />
                    <p className="text-[12px]">&copy; {currentYear} Navin Kumaran - All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default FooterComp;
