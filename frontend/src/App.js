import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, Trash2, ChevronUp, ChevronDown, Plus, DollarSign } from 'lucide-react';
import './App.css';

function App() {
  const [subscriptions, setSubscriptions] = useState(() => {
    const saved = localStorage.getItem('subscriptions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [annualExpense, setAnnualExpense] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    renewal_date: '',
    duration: 'monthly',
    type: 'personal',
    category: 'streaming',
    is_shared: false,
    shared_with: []
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isFormVisible, setIsFormVisible] = useState(false);

  const categories = [
    'streaming',
    'cloud',
    'development',
    'productivity',
    'communication',
    'other'
  ];

  const durations = [
    { value: 'monthly', label: 'Monthly', icon: Clock },
    { value: 'quarterly', label: 'Quarterly', icon: Clock },
    { value: 'semi-annual', label: 'Semi-Annual', icon: Calendar },
    { value: 'annual', label: 'Annual', icon: Calendar }
  ];

  useEffect(() => {
  localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  calculateExpenses();
}, [subscriptions, calculateExpenses]);

  const calculateExpenses = useCallback(() => {
  let monthly = 0;
  let annual = 0;

  subscriptions.forEach(sub => {
    const price = parseFloat(sub.price);
    switch (sub.duration) {
      case 'monthly':
        monthly += price;
        annual += price * 12;
        break;
      case 'quarterly':
        monthly += price / 3;
        annual += price * 4;
        break;
      case 'semi-annual':
        monthly += price / 6;
        annual += price * 2;
        break;
      case 'annual':
        monthly += price / 12;
        annual += price;
        break;
      default:
        break;
    }
  });

  setMonthlyExpense(monthly.toFixed(2));
  setAnnualExpense(annual.toFixed(2));
}, [subscriptions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSubscription = {
      ...formData,
      id: Date.now().toString(),
      price: parseFloat(formData.price),
      shared_with: formData.shared_with.filter(email => email.trim() !== '')
    };
    
    setSubscriptions([...subscriptions, newSubscription]);
    setFormData({
      name: '',
      price: '',
      renewal_date: '',
      duration: 'monthly',
      type: 'personal',
      category: 'streaming',
      is_shared: false,
      shared_with: []
    });
    setIsFormVisible(false);
  };

  const handleDelete = (id) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
  };

  const handleSort = (field) => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    setSortBy(field);

    const sortedSubscriptions = [...subscriptions].sort((a, b) => {
      if (field === 'price') {
        return newOrder === 'asc' 
          ? parseFloat(a[field]) - parseFloat(b[field])
          : parseFloat(b[field]) - parseFloat(a[field]);
      }
      return newOrder === 'asc'
        ? String(a[field]).localeCompare(String(b[field]))
        : String(b[field]).localeCompare(String(a[field]));
    });

    setSubscriptions(sortedSubscriptions);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'streaming':
        return '🎬';
      case 'cloud':
        return '☁️';
      case 'development':
        return '💻';
      case 'productivity':
        return '⚡';
      case 'communication':
        return '💬';
      default:
        return '📦';
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
            Digital Subscription Manager
          </h1>
          <p className="text-secondary-600 text-lg max-w-2xl mx-auto">
            Track and manage all your digital subscriptions in one place
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-secondary-900">Monthly Expense</h2>
              <DollarSign className="w-6 h-6 text-primary-500" />
            </div>
            <p className="text-4xl font-bold text-primary-600">${monthlyExpense}</p>
            <p className="text-secondary-500 mt-2">Per month</p>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-secondary-900">Annual Expense</h2>
              <Calendar className="w-6 h-6 text-accent-500" />
            </div>
            <p className="text-4xl font-bold text-accent-600">${annualExpense}</p>
            <p className="text-secondary-500 mt-2">Per year</p>
          </div>
        </motion.div>

        <div className="mb-8">
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="btn btn-primary w-full md:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            {isFormVisible ? 'Hide Form' : 'Add New Subscription'}
          </button>
        </div>

        <AnimatePresence>
          {isFormVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card p-6 mb-8"
            >
              <h2 className="text-2xl font-semibold text-secondary-900 mb-6">Add New Subscription</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="form-input pl-8"
                      required
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Renewal Date</label>
                  <input
                    type="date"
                    value={formData.renewal_date}
                    onChange={(e) => setFormData({...formData, renewal_date: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Duration</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="form-select"
                  >
                    {durations.map(duration => (
                      <option key={duration.value} value={duration.value}>
                        {duration.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="form-select"
                  >
                    <option value="personal">Personal</option>
                    <option value="official">Official</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="form-select"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-secondary-700 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.is_shared}
                      onChange={(e) => setFormData({...formData, is_shared: e.target.checked})}
                      className="form-checkbox mr-2"
                    />
                    Shared Subscription
                  </label>
                  {formData.is_shared && (
                    <input
                      type="text"
                      placeholder="Enter email addresses (comma-separated)"
                      value={formData.shared_with.join(', ')}
                      onChange={(e) => setFormData({
                        ...formData,
                        shared_with: e.target.value.split(',').map(email => email.trim())
                      })}
                      className="form-input mt-2"
                    />
                  )}
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="btn btn-primary w-full">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Subscription
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card overflow-hidden"
        >
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-secondary-900 mb-6">Your Subscriptions</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')} className="table-header px-6 py-3 text-left">
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        {sortBy === 'name' && (
                          sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th onClick={() => handleSort('price')} className="table-header px-6 py-3 text-left">
                      <div className="flex items-center space-x-1">
                        <span>Price</span>
                        {sortBy === 'price' && (
                          sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th onClick={() => handleSort('renewal_date')} className="table-header px-6 py-3 text-left">
                      <div className="flex items-center space-x-1">
                        <span>Renewal</span>
                        {sortBy === 'renewal_date' && (
                          sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th onClick={() => handleSort('type')} className="table-header px-6 py-3 text-left">
                      <div className="flex items-center space-x-1">
                        <span>Type</span>
                        {sortBy === 'type' && (
                          sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th onClick={() => handleSort('category')} className="table-header px-6 py-3 text-left">
                      <div className="flex items-center space-x-1">
                        <span>Category</span>
                        {sortBy === 'category' && (
                          sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  <AnimatePresence>
                    {subscriptions.map((subscription) => (
                      <motion.tr
                        key={subscription.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="table-row"
                      >
                        <td className="table-cell px-6 py-4">
                          <div className="font-medium text-secondary-900">{subscription.name}</div>
                          {subscription.is_shared && (
                            <div className="flex items-center text-xs text-secondary-500 mt-1">
                              <Users className="w-4 h-4 mr-1" />
                              Shared with: {subscription.shared_with.join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="table-cell px-6 py-4">
                          <div className="font-medium text-secondary-900">${subscription.price}</div>
                          <div className="text-xs text-secondary-500 mt-1">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {subscription.duration}
                          </div>
                        </td>
                        <td className="table-cell px-6 py-4">
                          <div className="font-medium text-secondary-900">
                            {new Date(subscription.renewal_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="table-cell px-6 py-4">
                          <span className={`badge ${
                            subscription.type === 'personal' ? 'badge-success' : 'badge-info'
                          }`}>
                            {subscription.type}
                          </span>
                        </td>
                        <td className="table-cell px-6 py-4">
                          <div className="flex items-center">
                            <span className="mr-2">{getCategoryIcon(subscription.category)}</span>
                            <span>{subscription.category}</span>
                          </div>
                        </td>
                        <td className="table-cell px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(subscription.id)}
                            className="btn btn-danger inline-flex items-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
