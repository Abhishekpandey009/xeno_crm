import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { ArrowUpDown, CheckCircle, Clock, AlertCircle, Send } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useNavigate } from 'react-router-dom';

interface CampaignRow {
  campaignId: string;
  name: string;
  date: string;
  sent: number;
  failed: number;
  total: number;
}

const StatusBadge = ({ sent, failed }: { sent: number; failed: number }) => {
  const total = sent + failed;
  if (total === 0) return <span className="text-gray-500">No logs</span>;
  if (failed === 0) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle size={14} className="mr-1" />
        All Sent
      </span>
    );
  } else if (sent === 0) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <AlertCircle size={14} className="mr-1" />
        All Failed
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock size={14} className="mr-1" />
        Partial Success
      </span>
    );
  }
};

const CampaignHistory = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCampaigns = async () => {
      const snapshot = await getDocs(collection(db, 'communication_log'));
      const logs = snapshot.docs.map(doc => doc.data());

      const grouped: Record<string, CampaignRow> = {};

      for (const log of logs) {
        const id = log.campaignId;
        if (!id) continue;

        if (!grouped[id]) {
          grouped[id] = {
            campaignId: id,
            name: log.subject || 'Unnamed',
            date: log.timestamp || new Date().toISOString(),
            sent: 0,
            failed: 0,
            total: 0,
          };
        }

        if (log.status === 'SENT') grouped[id].sent++;
        else if (log.status === 'FAILED') grouped[id].failed++;

        grouped[id].total++;
      }

      const rows = Object.values(grouped).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setCampaigns(rows);
      setLoading(false);
    };

    loadCampaigns();
  }, []);

  if (authLoading) return <p className="text-center">Loading user...</p>;
  if (!isAuthenticated) return <p className="text-center text-red-500">🔒 Please log in to view campaign history.</p>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign History</h1>
          <p className="mt-1 text-gray-600">View your past campaigns and delivery outcomes</p>
        </div>
        <Button onClick={() => navigate('/campaigns/new')} leftIcon={<Send size={16} />}>
          New Campaign
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No campaigns found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3">Campaign</th>
                  <th className="text-left px-6 py-3">Date</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Sent</th>
                  <th className="text-left px-6 py-3">Failed</th>
                  <th className="text-left px-6 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {campaigns.map(c => (
                  <tr key={c.campaignId} className="hover:bg-gray-50">
                    <td className="px-6 py-3">{c.name}</td>
                    <td className="px-6 py-3">{new Date(c.date).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                      <StatusBadge sent={c.sent} failed={c.failed} />
                    </td>
                    <td className="px-6 py-3">{c.sent}</td>
                    <td className="px-6 py-3">{c.failed}</td>
                    <td className="px-6 py-3">{c.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CampaignHistory;
