export const Button = ({ children, className = "", ...props }) => (
    <button
        className={`px-4 py-2 font-semibold text-sm bg-gray-900 text-white rounded-lg shadow-sm ${className}`}
        {...props}
    >
        {children}
    </button>
)

