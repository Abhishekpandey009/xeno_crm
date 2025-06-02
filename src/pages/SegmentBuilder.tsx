import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Users, ArrowRight } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

// Define field options for the segment builder
const fieldOptions = [
  { value: 'spent', label: 'Total Spent' },
  { value: 'visits', label: 'Number of Visits' },
  { value: 'lastPurchase', label: 'Days Since Last Purchase' },
  { value: 'location', label: 'Location' },
  { value: 'device', label: 'Device Type' },
  { value: 'source', label: 'Acquisition Source' },
];

// Define operator options
const operatorOptions = [
  { value: 'eq', label: '=' },
  { value: 'gt', label: '>' },
  { value: 'lt', label: '<' },
  { value: 'gte', label: '>=' },
  { value: 'lte', label: '<=' },
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Does not contain' },
];

// Define condition type
interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

const SegmentBuilder = () => {
  const navigate = useNavigate();
  const [conditions, setConditions] = useState<Condition[]>([
    { id: '1', field: 'spent', operator: 'gt', value: '100' },
  ]);
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');
  const [userCount, setUserCount] = useState<number>(42);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // AI prompt logic
  const [prompt, setPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIPrompt = async () => {
    setAiLoading(true);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173", // change this to your deployed site if needed
          "X-Title": "Xeno Segment Generator"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo", // or mistralai/mixtral-8x7b, etc.
          messages: [
            {
              role: "system",
              content: `
                  You are a customer segmentation assistant.

                  Given a natural language marketing prompt, return ONLY a valid JSON array of objects.

                  Each object must include:
                  - "field" (like 'spent', 'lastPurchase', 'visits')
                  - "operator" (gt, lt, eq, contains, etc.)
                  - "value" (must be a number or string)

                  Interpret time frames like "6 months ago" as numeric days using the 'lastPurchase' field. For example:
                  "hasn’t shopped in 6 months" → { "field": "lastPurchase", "operator": "gt", "value": "180" }

                  NEVER return text like "6 months ago" as a value.

                  ONLY return a JSON array of rules. DO NOT explain anything.
`

            },
            {
              role: "user",
              content: `Convert this: ${prompt}`
            }
          ]
        })
      });

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      const updated = parsed.map((item: any, index: number) => ({
        ...item,
        id: (Date.now() + index).toString()
      }));
      setConditions(updated);
    } catch (err) {
      console.error('AI error:', err);
      alert("Failed to generate rules. Try refining your prompt.");
    }
    setAiLoading(false);
  };

  // Recalculate user count when conditions change
  useEffect(() => {
    const calculateUserCount = () => {
      setIsCalculating(true);
      setTimeout(() => {
        const baseCount = 150;
        const multiplier = logic === 'AND' ? 0.6 : 1.2;
        const newCount = Math.max(0, Math.floor(baseCount - conditions.length * 20 * multiplier));
        setUserCount(newCount);
        setIsCalculating(false);
      }, 800);
    };
    calculateUserCount();
  }, [conditions, logic]);

  const addCondition = () => {
    const newCondition: Condition = {
      id: Date.now().toString(),
      field: 'visits',
      operator: 'gt',
      value: '5',
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter(condition => condition.id !== id));
    }
  };

  const updateCondition = (id: string, field: string, value: string) => {
    setConditions(
      conditions.map(condition =>
        condition.id === id ? { ...condition, [field]: value } : condition
      )
    );
  };

  const goToAudiencePreview = () => {
    navigate('/segments/audience');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Segment</h1>
          <p className="mt-1 text-gray-600">Define your audience by adding conditions or using AI</p>
        </div>
        <div className="flex items-center space-x-3">
          {isCalculating ? (
            <div className="flex items-center text-gray-500">
              <svg className="animate-spin mr-2 h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Calculating...
            </div>
          ) : (
            <div className="flex items-center text-sm font-medium px-3 py-1 bg-primary-100 text-primary-800 rounded-full">
              <Users size={16} className="mr-1" />
              {userCount} users match
            </div>
          )}
          <Button onClick={goToAudiencePreview} rightIcon={<ArrowRight size={16} />}>
            Preview Audience
          </Button>
        </div>
      </div>

      <Card>
        <div className="space-y-6">
          {/* Prompt Input with AI */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Natural Language Prompt</label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="e.g., People who haven't shopped in 6 months and spent over ₹5000"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button onClick={handleAIPrompt} isLoading={aiLoading}>
                Generate Rules
              </Button>
            </div>
          </div>

          {/* Logic Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Match users who meet:
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => setLogic('AND')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  logic === 'AND'
                    ? 'bg-primary-100 text-primary-800 border border-primary-200'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                ALL conditions
              </button>
              <button
                onClick={() => setLogic('OR')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  logic === 'OR'
                    ? 'bg-primary-100 text-primary-800 border border-primary-200'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                ANY condition
              </button>
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-4">
            {conditions.map((condition, index) => (
              <div key={condition.id} className="flex items-center space-x-3">
                {index > 0 && (
                  <div className="text-sm font-medium text-gray-500 w-12 text-center">{logic}</div>
                )}
                <div className={index === 0 ? 'ml-0' : 'ml-12'}>
                  <div className="flex flex-wrap md:flex-nowrap items-center space-y-2 md:space-y-0 md:space-x-3">
                    {/* Field Selector */}
                    <div className="w-full md:w-1/3">
                      <select
                        value={condition.field}
                        onChange={(e) => updateCondition(condition.id, 'field', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        {fieldOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Operator Selector */}
                    <div className="w-full md:w-1/4">
                      <select
                        value={condition.operator}
                        onChange={(e) => updateCondition(condition.id, 'operator', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        {operatorOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Value Input */}
                    <div className="w-full md:w-1/3">
                      <input
                        type="text"
                        value={condition.value}
                        onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Value"
                      />
                    </div>

                    {/* Remove Button */}
                    <div>
                      <button
                        onClick={() => removeCondition(condition.id)}
                        disabled={conditions.length === 1}
                        className={`p-2 rounded-md ${
                          conditions.length === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                        }`}
                        title="Remove condition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Condition Button */}
          <div>
            <Button
              variant="outline"
              onClick={addCondition}
              leftIcon={<Plus size={16} />}
              size="sm"
            >
              Add Condition
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SegmentBuilder;
