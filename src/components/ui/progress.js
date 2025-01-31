export const Progress = ({ value }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
            className={`h-2.5 rounded-full ${value >= 70 ? "bg-green-500" : "bg-red-500"}`}
            style={{ width: `${value}%` }}
        />
    </div>
)

