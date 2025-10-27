interface StatCardProps {
  title: string;
  value: string | number;
  maxValue?: number;
  badge?: {
    text: string;
    color: 'green' | 'blue' | 'orange' | 'red';
  };
  progress?: number;
  subtitle?: string;
  gradientColor: 'blue' | 'green' | 'orange' | 'purple';
}

const gradientColors = {
  blue: 'from-blue-600 to-indigo-600',
  green: 'from-green-600 to-emerald-600',
  orange: 'from-orange-600 to-amber-600',
  purple: 'from-purple-600 to-pink-600',
};

const badgeColors = {
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  orange: 'bg-orange-100 text-orange-800',
  red: 'bg-red-100 text-red-800',
};

export default function StatCard({ 
  title, 
  value, 
  maxValue, 
  badge, 
  progress, 
  subtitle,
  gradientColor 
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-600">{title}</h3>
        {badge && (
          <span className={`text-xs px-2 py-1 rounded-lg font-bold ${badgeColors[badge.color]}`}>
            {badge.text}
          </span>
        )}
      </div>
      <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
        {value}{maxValue && `/${maxValue}`}
      </div>
      {subtitle && (
        <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2">{subtitle}</p>
      )}
      {progress !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
          <div
            className={`bg-gradient-to-r ${gradientColors[gradientColor]} h-2 sm:h-3 rounded-full shadow-sm transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
