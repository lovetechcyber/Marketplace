import { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Profile() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get('/api/transactions/mine', { withCredentials: true })
      .then(res => setTransactions(res.data))
      .catch(err => console.error(err));
  }, []);

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter(t => t.status === filter);

  const generatePDF = (txn) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Transaction Receipt', 14, 22);
    doc.setFontSize(12);

    doc.autoTable({
      startY: 30,
      head: [['Field', 'Details']],
      body: [
        ['Reference', txn.paymentRef],
        ['Product', txn.productId.title],
        ['Amount', `₦${txn.amount}`],
        ['Status', txn.status],
        ['Date', new Date(txn.createdAt).toLocaleString()]
      ]
    });

    doc.save(`receipt-${txn.paymentRef}.pdf`);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">My Transactions</h1>

      <div className="mb-4">
        <label className="mr-2 font-medium">Filter:</label>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="border px-2 py-1 rounded">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="delivered">Delivered</option>
          <option value="released">Released</option>
          <option value="disputed">Disputed</option>
        </select>
      </div>

      {filtered.map(txn => (
        <div key={txn._id} className="border p-4 mb-3 rounded bg-white shadow-sm">
          <p><strong>Product:</strong> {txn.productId?.title}</p>
          <p><strong>Amount:</strong> ₦{txn.amount}</p>
          <p>
            <strong>Status:</strong>
            <span className={`ml-1 font-semibold text-${
              txn.status === 'pending' ? 'yellow' :
              txn.status === 'released' ? 'green' :
              txn.status === 'disputed' ? 'red' : 'gray'
            }-600`}>
              {txn.status.toUpperCase()}
            </span>
          </p>
          <p><strong>Ref:</strong> {txn.paymentRef}</p>
          <button
            onClick={() => generatePDF(txn)}
            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Download Receipt
          </button>
        </div>
      ))}
    </div>
  );
}
