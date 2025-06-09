
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaListAlt, FaTrash, FaSearch, FaSort, FaSortUp, FaSortDown, FaInfoCircle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useAppContext } from '../contexts/AppContext';
import StyledButton from '../components/shared/StyledButton';
import { ActivityLogEntry } from '../types';

type SortConfig = {
  key: keyof ActivityLogEntry;
  direction: 'ascending' | 'descending';
} | null;

const ActivityLogPage: React.FC = () => {
  const { theme, translate, activityLog, clearActivityLog, language } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failure' | 'info'>('all');

  const isRTL = language === 'ar';

  const filteredAndSortedLog = useMemo(() => {
    let logItems = [...activityLog];

    if (filterStatus !== 'all') {
      logItems = logItems.filter(item => item.status === filterStatus);
    }

    if (searchTerm) {
      logItems = logItems.filter(item => 
        item.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.targetFile && item.targetFile.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (sortConfig !== null) {
      logItems.sort((a, b) => {
        const valA = a[sortConfig.key] ?? (sortConfig.key === 'timestamp' ? 0 : '');
        const valB = b[sortConfig.key] ?? (sortConfig.key === 'timestamp' ? 0 : '');

        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    } else {
        logItems.sort((a,b) => b.timestamp - a.timestamp);
    }
    return logItems;
  }, [activityLog, searchTerm, sortConfig, filterStatus]);

  const requestSort = (key: keyof ActivityLogEntry) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof ActivityLogEntry) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FaSort className={`inline opacity-50 ${isRTL ? 'mr-1' : 'ml-1'}`} />;
    }
    return sortConfig.direction === 'ascending' ? <FaSortUp className={`inline ${isRTL ? 'mr-1' : 'ml-1'}`} /> : <FaSortDown className={`inline ${isRTL ? 'mr-1' : 'ml-1'}`} />;
  };
  
  const getStatusIcon = (status: ActivityLogEntry['status']) => {
    switch(status) {
        case 'success': return <FaCheckCircle className="text-green-500 dark:text-green-400" />;
        case 'failure': return <FaTimesCircle className="text-red-500 dark:text-red-400" />;
        case 'info': return <FaInfoCircle className="text-blue-500 dark:text-blue-400" />;
        default: return <FaInfoCircle className="text-gray-500 dark:text-gray-400" />;
    }
  };


  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-6"
    >
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h1 className={`text-3xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'} ${isRTL ? 'flex-row-reverse' : ''}`}>
          <FaListAlt className={`text-knoux-dark-primary dark:text-knoux-light-primary ${isRTL ? 'ml-3' : 'mr-3'}`} />
          {translate('activityLog')}
        </h1>
        <StyledButton onClick={clearActivityLog} variant="danger" iconLeft={<FaTrash />} disabled={activityLog.length === 0}>
          {translate('clearLog')}
        </StyledButton>
      </div>

      {/* Filters and Search */}
      <div className={`p-4 rounded-xl 
                       ${theme === 'dark' ? 'bg-knoux-dark-surface/80 backdrop-blur-sm border-knoux-dark-primary/40 shadow-[var(--knoux-glow-secondary-deep)]' 
                                        : 'bg-knoux-light-surface/90 backdrop-blur-sm border-knoux-light-primary/40 shadow-xl'}
                       flex flex-col md:flex-row gap-4 items-center ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className="relative flex-grow w-full md:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={translate('searchLogs')}
            className={`w-full p-3 rounded-lg border neon-focus-ring-primary
                        ${theme === 'dark' ? 'bg-knoux-dark-bg text-gray-200 border-knoux-dark-primary/50' : 'bg-white text-gray-700 border-gray-300'} 
                        ${isRTL ? 'rtl:pr-10 ltr:pl-10' : 'ltr:pl-10 rtl:pr-10'}`}
          />
          <FaSearch className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} ${isRTL ? 'right-3' : 'left-3'}`} />
        </div>
        <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <label className={`text-sm ${isRTL ? 'ml-2' : 'mr-2'} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{translate('filterByStatus')}:</label>
            <select 
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as 'all' | 'success' | 'failure' | 'info')}
                className={`p-2 rounded-md border text-sm neon-focus-ring-primary
                            ${theme === 'dark' ? 'bg-knoux-dark-bg text-gray-200 border-knoux-dark-primary/50' : 'bg-white text-gray-700 border-gray-300'}`}
            >
                <option value="all">{translate('all')}</option>
                <option value="success">{translate('success')}</option>
                <option value="failure">{translate('failure')}</option>
                <option value="info">{translate('info')}</option>
            </select>
        </div>
      </div>
      
      {/* Log Table */}
      <div className={`overflow-x-auto rounded-xl shadow-lg custom-scrollbar
                       ${theme === 'dark' ? 'bg-knoux-dark-surface/70 backdrop-blur-sm border-knoux-dark-primary/30 shadow-[var(--knoux-glow-primary-deep)]' 
                                        : 'bg-knoux-light-surface/80 backdrop-blur-sm border-knoux-light-primary/30 shadow-lg'}`}>
        <table className="min-w-full divide-y dark:divide-knoux-dark-primary/20 light:divide-knoux-light-primary/20">
          <thead className={`${theme === 'dark' ? 'bg-knoux-dark-bg/60' : 'bg-gray-100/60'}`}>
            <tr>
              <th scope="col" className={`px-4 py-3 text-xs font-medium uppercase tracking-wider cursor-pointer ${isRTL ? 'text-right' : 'text-left'}`} onClick={() => requestSort('timestamp')}>
                {translate('logTimestamp')} {getSortIcon('timestamp')}
              </th>
              <th scope="col" className={`px-4 py-3 text-xs font-medium uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                {translate('status')}
              </th>
              <th scope="col" className={`px-4 py-3 text-xs font-medium uppercase tracking-wider cursor-pointer ${isRTL ? 'text-right' : 'text-left'}`} onClick={() => requestSort('operation')}>
                {translate('logOperation')} {getSortIcon('operation')}
              </th>
              <th scope="col" className={`px-4 py-3 text-xs font-medium uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                {translate('logEntryDetails')}
              </th>
               <th scope="col" className={`px-4 py-3 text-xs font-medium uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                {translate('targetFile')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-knoux-dark-primary/30 light:divide-knoux-light-primary/30">
            {filteredAndSortedLog.length > 0 ? filteredAndSortedLog.map(entry => (
              <tr key={entry.id} className={`${theme === 'dark' ? 'hover:bg-knoux-dark-bg/40' : 'hover:bg-gray-100/40'}`}>
                <td className={`px-4 py-3 whitespace-nowrap text-xs ${isRTL ? 'text-right' : 'text-left'}`}>{new Date(entry.timestamp).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}</td>
                <td className={`px-4 py-3 whitespace-nowrap text-xs ${isRTL ? 'text-right' : 'text-left'}`}>{getStatusIcon(entry.status)}</td>
                <td className={`px-4 py-3 whitespace-nowrap text-xs font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{translate(entry.operation) || entry.operation}</td>
                <td className={`px-4 py-3 text-xs max-w-sm break-words ${isRTL ? 'text-right' : 'text-left'}`}>{entry.details}</td>
                <td className={`px-4 py-3 text-xs max-w-xs break-all ${isRTL ? 'text-right' : 'text-left'}`}>{entry.targetFile || 'N/A'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm">{translate('logEmpty')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default ActivityLogPage;
