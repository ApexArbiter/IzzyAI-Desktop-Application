export const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>{children}</div>
)

export const CardHeader = ({ children }) => <div className="p-6 border-b border-gray-200">{children}</div>

export const CardTitle = ({ children }) => <h2 className="text-xl font-semibold text-gray-800">{children}</h2>

export const CardContent = ({ children, className = "" }) => <div className={`p-6 ${className}`}>{children}</div>

