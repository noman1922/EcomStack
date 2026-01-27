const SectionHeading = ({ title, subtitle, linkText, linkTo }) => {
    return (
        <div className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-3xl font-bold mb-2">{title}</h2>
                {subtitle && <p className="text-muted">{subtitle}</p>}
            </div>
            {linkText && linkTo && (
                <a href={linkTo} className="text-blue-500 hover:text-blue-400 font-medium transition-colors flex items-center">
                    {linkText}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </a>
            )}
        </div>
    );
};

export default SectionHeading;
