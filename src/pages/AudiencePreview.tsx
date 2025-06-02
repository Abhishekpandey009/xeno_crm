import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Users } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

const AudiencePreview = () => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sampleUsers, setSampleUsers] = useState<any[]>([]);

  // Simulate fetching audience data
  useEffect(() => {
    const fetchAudienceData = async () => {
      setLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        // Random user count between 0 and 150
        const count = Math.floor(Math.random() * 151);
        setUserCount(count);
        
        // Generate sample users if count > 0
        if (count > 0) {
          const samples = Array.from({ length: Math.min(5, count) }, (_, i) => ({
            id: i + 1,
            name: ['John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis', 'Michael Wilson'][i],
            email: ['john@example.com', 'jane@example.com', 'robert@example.com', 'emily@example.com', 'michael@example.com'][i],
            spent: `$${Math.floor(Math.random() * 1000)}`,
            lastSeen: ['2 days ago', '5 hours ago', 'Yesterday', '1 week ago', 'Just now'][i],
          }));
          setSampleUsers(samples);
        } else {
          setSampleUsers([]);
        }
        
        setLoading(false);
      }, 1500);
    };
    
    fetchAudienceData();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/segments/builder')}
            className="mr-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audience Preview</h1>
            <p className="mt-1 text-gray-600">View matching users for your segment</p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/campaigns/new')}
          leftIcon={<Send size={16} />}
          disabled={loading || userCount === 0}
        >
          Create Campaign
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading audience data...</p>
          </div>
        ) : userCount === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No matching users found</h3>
            <p className="mt-2 text-gray-600">Try adjusting your segment conditions</p>
            <Button
              variant="outline"
              onClick={() => navigate('/segments/builder')}
              className="mt-6"
            >
              Edit Segment
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center bg-primary-50 text-primary-800 px-4 py-2 rounded-md">
                <Users size={20} className="mr-2" />
                <span className="font-medium">{userCount} matching users</span>
              </div>
              <div className="text-sm text-gray-500">
                Showing sample of first 5 users
              </div>
            </div>

            {/* Sample user table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Seen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sampleUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {user.spent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {user.lastSeen}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AudiencePreview;