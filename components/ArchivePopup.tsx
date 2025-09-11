import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Check } from 'lucide-react';
import { fetchAllAvailablePuzzles } from '../utils/dailyPuzzle';
import { trackArchiveView, trackArchivePuzzleLoad, trackModalOpen, trackModalClose } from '../utils/analytics';
import { useLeaderboard } from '../hooks/useLeaderboard';

interface ArchivePopupProps {
  onClose: () => void;
  onSelectDate: (date: string) => void;
  availablePuzzles: {date: string; difficulty: string}[];
  userId?: string;
}

const ArchivePopup: React.FC<ArchivePopupProps> = ({ onClose, onSelectDate, availablePuzzles, userId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const { getUserCompletedDates } = useLeaderboard();

  // Lock/unlock body scroll when modal opens/closes
  React.useEffect(() => {
    trackModalOpen('archive');
    document.body.style.overflow = 'hidden';

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    // Track archive popup view
    trackArchiveView();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const fetchCompletedDates = async () => {
      if (userId && getUserCompletedDates) {
        try {
          const dates = await getUserCompletedDates(userId);
          setCompletedDates(dates);
        } catch (error) {
          console.error('Error fetching completed dates:', error);
        }
      }
    };
    
    fetchCompletedDates();
  }, [userId, getUserCompletedDates]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    } catch (error) {
      return { day: 'Invalid', date: 'Date' };
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDateSelect = (date: string) => {
    // Track archive puzzle selection
    trackArchivePuzzleLoad(date, true);
    onSelectDate(date);
    onClose();
  };

  const isDateCompleted = (date: string) => completedDates.includes(date);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-black p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center justify-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Archive Games</h2>
          </div>
          
          <p className="text-gray-100">Select a previous day to play</p>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading available puzzles...</p>
            </div>
          ) : availablePuzzles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No archive puzzles available</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {/* Today's Game */}
              <button
                onClick={() => handleDateSelect(new Date().toLocaleDateString('en-CA'))}
                className="relative p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center border-2 border-blue-300 hover:border-blue-400"
              >
                {isDateCompleted(new Date().toLocaleDateString('en-CA')) && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                <div className="text-xs font-medium text-blue-800 mb-1">
                  Today
                </div>
                <div className="text-sm font-semibold text-blue-900 mb-2">
                  {(() => {
                    const today = new Date();
                    const { date } = formatDate(today.toLocaleDateString('en-CA'));
                    return date;
                  })()}
                </div>
              </button>
              
              {availablePuzzles.map((puzzle) => {
                const { day, date } = formatDate(puzzle.date);
                const isCompleted = isDateCompleted(puzzle.date);
                return (
                <button
                  key={puzzle.date}
                  onClick={() => handleDateSelect(puzzle.date)}
                  className="relative p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center border border-gray-200 hover:border-gray-300"
                >
                  {isCompleted && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  <div className="text-xs font-medium text-gray-800 mb-1">
                    {day}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">
                    {date}
                  </div>
                </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchivePopup;