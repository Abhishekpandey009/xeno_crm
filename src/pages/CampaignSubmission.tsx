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

  const { user, isAuthenticated, loading: authLoading } = useAuth();

  if (authLoading) return <p className="text-center">Loading user...</p>;
  if (!isAuthenticated) return <p className="text-center">🔒 Please log in to submit a campaign.</p>;

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const key = import.meta.env.VITE_OPENROUTER_API_KEY;
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'MarketPro Campaign Builder',
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            { role: 'user', content: `Generate 3 short, friendly marketing messages for the goal: "${goal}"` }
          ],
        }),
      });

      const data = await res.json();
      const lines = data.choices?.[0]?.message?.content?.split('\n').filter(Boolean) || [];
      setSuggestions(lines);
    } catch (err) {
      alert('Error generating messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaignName || !message) return alert('Missing fields');

    const newCampaign = {
      uid: user?.uid,
      name: campaignName,
      goal,
      message,
      date: new Date().toISOString(),
      status: 'completed',
    };

    try {
      await addDoc(collection(db, 'campaigns'), newCampaign);
      alert('✅ Campaign Saved');
    } catch (err) {
      alert('Error saving campaign');
    }
  };

  const handleSendWithBackend = async () => {
    if (!campaignName || !message) return alert('Missing fields');

    try {
      const snapshot = await getDocs(collection(db, 'customers'));
      const customers = snapshot.docs.map(doc => {
        const data = doc.data() as {
          name: string;
          email: string;
          [key: string]: any;
        };
        return { id: doc.id, ...data };
      });

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

        await fetch('http://localhost:5000/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: customer.email,
            subject: campaignName,
            text: personalized,
          }),
        });

        await fetch('http://localhost:4000/api/delivery-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId,
            customerId: customer.id,
            status,
            subject: campaignName, // ✅ Ensures campaign history works
          }),
        });
      }

      alert('✅ Campaign delivery simulated and logged!');
    } catch (error) {
      console.error(error);
      alert('❌ Error during backend delivery simulation');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
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

      <button onClick={generateSuggestions} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? 'Loading...' : 'Generate AI Messages'}
      </button>

      <ul className="my-3">
        {suggestions.map((s, idx) => (
          <li key={idx}>
            <button className="w-full text-left bg-gray-100 my-1 p-2 rounded" onClick={() => setMessage(s)}>
              {s}
            </button>
          </li>
        ))}
      </ul>

      <textarea
        rows={4}
        placeholder="Final message"
        value={message}
        onChange={e => setMessage(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      />

      <div className="flex gap-2">
        <button onClick={handleSendCampaign} className="bg-green-600 text-white px-4 py-2 rounded">
          Save Campaign
        </button>
        <button onClick={handleSendWithBackend} className="bg-purple-600 text-white px-4 py-2 rounded">
          Send via Backend
        </button>
      </div>
    </div>
  );
};

export default CampaignSubmission;
