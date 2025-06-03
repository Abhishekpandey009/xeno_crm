import { useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const CampaignSubmission = () => {
  const [campaignName, setCampaignName] = useState('');
  const [goal, setGoal] = useState('');
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (authLoading) return <p className="text-center">Loading user...</p>;
  if (!isAuthenticated) return <p className="text-center">🔒 Please log in to submit a campaign.</p>;

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://xeno-crm-abhishek-pandeys-projects-2208186e.vercel.app',
          'X-Title': 'MarketPro Campaign Builder',
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [{ role: 'user', content: `Generate 3 short, friendly marketing messages for the goal: "${goal}"` }],
        }),
      });

      const data = await res.json();
      const lines = data.choices?.[0]?.message?.content?.split('\n').filter(Boolean) || [];
      setSuggestions(lines);
    } catch {
      alert('❌ Error generating messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaignName || !message) return alert('Missing fields');
    try {
      await addDoc(collection(db, 'campaigns'), {
        uid: user?.uid,
        name: campaignName,
        goal,
        message,
        date: new Date().toISOString(),
        status: 'completed',
      });
      alert('✅ Campaign saved');
    } catch {
      alert('❌ Error saving campaign');
    }
  };

  const handleSendWithBackend = async () => {
    if (!campaignName || !message) return alert('Missing fields');
    setSending(true);

    try {
      const snapshot = await getDocs(collection(db, 'customers'));
      const customers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as { id: string; name: string; email: string }[];

      const campaignId = `camp_${Date.now()}`;

      await addDoc(collection(db, 'campaigns'), {
        uid: user?.uid,
        name: campaignName,
        goal,
        message,
        date: new Date().toISOString(),
        status: 'sent',
        campaignId,
      });

      for (const customer of customers) {
        const status = Math.random() < 0.9 ? 'SENT' : 'FAILED';
        const personalized = `Hi ${customer.name}, ${message}`;

        await fetch(`${BACKEND_URL}/api/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: customer.email, subject: campaignName, text: personalized }),
        });

        await fetch(`${BACKEND_URL}/api/delivery-receipt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId,
            customerId: customer.id,
            status,
            subject: campaignName,
          }),
        });
      }

      alert('✅ Campaign delivery simulated and logged!');
      setCampaignName('');
      setGoal('');
      setMessage('');
      setSuggestions([]);
    } catch (error) {
      console.error(error);
      alert('❌ Error during backend delivery simulation');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-2xl font-bold mb-4">Create Campaign</h2>

      <input
        type="text"
        placeholder="Campaign Name"
        value={campaignName}
        onChange={e => setCampaignName(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        type="text"
        placeholder="Campaign Goal"
        value={goal}
        onChange={e => setGoal(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <button
        onClick={generateSuggestions}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : 'Generate AI Messages'}
      </button>

      <ul className="my-3">
        {suggestions.map((s, idx) => (
          <li key={idx}>
            <button
              className="w-full text-left bg-gray-100 hover:bg-gray-200 my-1 p-2 rounded"
              onClick={() => setMessage(s)}
            >
              {s}
            </button>
          </li>
        ))}
        {!loading && suggestions.length === 0 && (
          <p className="text-sm text-gray-500 italic mt-2">No suggestions yet. Generate above 👆</p>
        )}
      </ul>

      <textarea
        rows={4}
        placeholder="Final message"
        value={message}
        onChange={e => setMessage(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      />

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSendCampaign}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Save Campaign
        </button>
        <button
          onClick={handleSendWithBackend}
          disabled={sending}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Sending...' : 'Send via Backend'}
        </button>
      </div>
    </div>
  );
};

export default CampaignSubmission;
