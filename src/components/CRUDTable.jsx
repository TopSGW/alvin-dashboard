import React, { useState, useEffect } from 'react';
import { getCaseDetails, createCaseDetail, updateCaseDetail, deleteCaseDetail, getCaseLength } from '../services/api';

const CRUDTable = () => {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [newEntry, setNewEntry] = useState({
    inquiry: '',
    name: '',
    mobile_number: '',
    email_address: '',
    appointment_date_time: '',
    category_text: '',
    divide_text: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalEntries, setTotalEntries] = useState(0);

  useEffect(() => {
    fetchCaseDetails();
  }, [page, limit]);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      const response = await getCaseDetails(page * limit, limit);
      const itemCounts = await getCaseLength();
      if (Array.isArray(response)) {
        setData(response);
        setTotalEntries(itemCounts.count);
      } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
        setData(response.data);
        setTotalEntries(response.total || response.data.length);
      } else if (response && typeof response === 'object') {
        const possibleArrays = ['items', 'results', 'case_details'];
        for (const key of possibleArrays) {
          if (Array.isArray(response[key])) {
            setData(response[key]);
            setTotalEntries(response.total || response[key].length);
            return;
          }
        }
        throw new Error('Invalid data format received from API');
      } else {
        throw new Error('Invalid data format received from API');
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch case details: ' + (err.response?.data?.detail || err.message));
      console.error('Error fetching case details:', err);
      setData([]);
      setTotalEntries(0);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    setEditingId(id);
    const editingItem = data.find(item => item.id === id);
    setEditingData(editingItem);
  };

  const handleEditInputChange = (e, id) => {
    const { name, value } = e.target;
    setEditingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    try {
      setLoading(true);
      const dataToUpdate = {
        inquiry: editingData.inquiry,
        name: editingData.name,
        mobile_number: editingData.mobile_number,
        email_address: editingData.email_address,
        appointment_date_time: editingData.appointment_date_time,
        category_text: editingData.category_text,
        divide_text: editingData.divide_text,
      };
      await updateCaseDetail(id, dataToUpdate);
      await fetchCaseDetails();
      setEditingId(null);
      setEditingData({});
    } catch (err) {
      setError('Failed to update case detail: ' + (err.response?.data?.detail || err.message));
      console.error('Error updating case detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        setLoading(true);
        await deleteCaseDetail(id);
        await fetchCaseDetails();
      } catch (err) {
        setError('Failed to delete case detail: ' + (err.response?.data?.detail || err.message));
        console.error('Error deleting case detail:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAdd = async () => {
    try {
      setLoading(true);
      await createCaseDetail(newEntry);
      await fetchCaseDetails();
      resetNewEntry();
    } catch (err) {
      setError('Failed to create case detail: ' + (err.response?.data?.detail || err.message));
      console.error('Error creating case detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry({ ...newEntry, [name]: value });
  };

  const resetNewEntry = () => {
    setNewEntry({
      inquiry: '',
      name: '',
      mobile_number: '',
      email_address: '',
      appointment_date_time: '',
      category_text: '',
      divide_text: '',
    });
  };

  const handleNextPage = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handlePrevPage = () => {
    setPage(prevPage => Math.max(0, prevPage - 1));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchTerm);
  };

  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-8">
      <div className="py-8">
        <h2 className="text-2xl font-semibold leading-tight mb-4">Data Management</h2>
        <h3 className="text-xl font-semibold leading-tight mb-4">Case Details</h3>
        <div className="my-2 flex sm:flex-row flex-col">
          <div className="flex flex-row mb-1 sm:mb-0">
            <div className="relative">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  className="appearance-none rounded-r rounded-l sm:rounded-l-none border border-gray-400 border-b block pl-8 pr-6 py-2 w-full bg-white text-sm placeholder-gray-400 text-gray-700 focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
            </div>
          </div>
        </div>
        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
          <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Inquiry
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Mobile Number
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email Address
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Appointment Date/Time
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Division
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          name="inquiry"
                          value={editingData.inquiry}
                          onChange={(e) => handleEditInputChange(e, item.id)}
                          className="w-full px-2 py-1 text-gray-700 border rounded"
                        />
                      ) : (
                        <p className="text-gray-900 whitespace-no-wrap">{item.inquiry}</p>
                      )}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          name="name"
                          value={editingData.name}
                          onChange={(e) => handleEditInputChange(e, item.id)}
                          className="w-full px-2 py-1 text-gray-700 border rounded"
                        />
                      ) : (
                        <p className="text-gray-900 whitespace-no-wrap">{item.name}</p>
                      )}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          name="mobile_number"
                          value={editingData.mobile_number}
                          onChange={(e) => handleEditInputChange(e, item.id)}
                          className="w-full px-2 py-1 text-gray-700 border rounded"
                        />
                      ) : (
                        <p className="text-gray-900 whitespace-no-wrap">{item.mobile_number}</p>
                      )}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                      {editingId === item.id ? (
                        <input
                          type="email"
                          name="email_address"
                          value={editingData.email_address}
                          onChange={(e) => handleEditInputChange(e, item.id)}
                          className="w-full px-2 py-1 text-gray-700 border rounded"
                        />
                      ) : (
                        <p className="text-gray-900 whitespace-no-wrap">{item.email_address}</p>
                      )}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                      {editingId === item.id ? (
                        <input
                          type="datetime-local"
                          name="appointment_date_time"
                          value={editingData.appointment_date_time}
                          onChange={(e) => handleEditInputChange(e, item.id)}
                          className="w-full px-2 py-1 text-gray-700 border rounded"
                        />
                      ) : (
                        <p className="text-gray-900 whitespace-no-wrap">
                          {new Date(item.appointment_date_time).toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          name="category_text"
                          value={editingData.category_text}
                          onChange={(e) => handleEditInputChange(e, item.id)}
                          className="w-full px-2 py-1 text-gray-700 border rounded"
                        />
                      ) : (
                        <p className="text-gray-900 whitespace-no-wrap">{item.category_text}</p>
                      )}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          name="divide_text"
                          value={editingData.divide_text}
                          onChange={(e) => handleEditInputChange(e, item.id)}
                          className="w-full px-2 py-1 text-gray-700 border rounded"
                        />
                      ) : (
                        <p className="text-gray-900 whitespace-no-wrap">{item.divide_text}</p>
                      )}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                      {editingId === item.id ? (
                        <button
                          onClick={() => handleSave(item.id)}
                          className="text-green-600 hover:text-green-900 mr-2"
                          title="Save"
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                          title="Edit"
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
              <span className="text-xs xs:text-sm text-gray-900">
                Showing {filteredData.length > 0 ? page * limit + 1 : 0} to {Math.min((page + 1) * limit, totalEntries)} of {totalEntries} Entries
              </span>
              <div className="inline-flex mt-2 xs:mt-0">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 0}
                  className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-l"
                >
                  Prev
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={(page + 1) * limit >= totalEntries}
                  className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-r"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <h4 className="text-lg font-semibold mb-4">Add New Entry</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="inquiry"
              value={newEntry.inquiry}
              onChange={handleInputChange}
              placeholder="Inquiry"
              className="border rounded px-3 py-2 w-full"
            />
            <input
              type="text"
              name="name"
              value={newEntry.name}
              onChange={handleInputChange}
              placeholder="Name"
              className="border rounded px-3 py-2 w-full"
            />
            <input
              type="tel"
              name="mobile_number"
              value={newEntry.mobile_number}
              onChange={handleInputChange}
              placeholder="Mobile Number"
              className="border rounded px-3 py-2 w-full"
            />
            <input
              type="email"
              name="email_address"
              value={newEntry.email_address}
              onChange={handleInputChange}
              placeholder="Email Address"
              className="border rounded px-3 py-2 w-full"
            />
            <input
              type="datetime-local"
              name="appointment_date_time"
              value={newEntry.appointment_date_time}
              onChange={handleInputChange}
              className="border rounded px-3 py-2 w-full"
            />
            <input
              type="text"
              name="category_text"
              value={newEntry.category_text}
              onChange={handleInputChange}
              placeholder="Category"
              className="border rounded px-3 py-2 w-full"
            />
            <input
              type="text"
              name="divide_text"
              value={newEntry.divide_text}
              onChange={handleInputChange}
              placeholder="Division"
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <button
            onClick={handleAdd}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default CRUDTable;