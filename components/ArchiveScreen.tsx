import React, { useState, useEffect } from 'react';
import { X, Calendar, Check } from 'lucide-react';
import { trackArchiveView, trackArchivePuzzleLoad, trackModalOpen, trackModalClose } from '../utils/analytics';
import { useLeaderboard } from '../hooks/useLeaderboard';
import styles from '../styles/ArchiveScreen.module.css';

interface ArchiveScreenProps {
  onClose: () => void;
  onSelectDate: (date: string) => void;
  availablePuzzles: {date: string; difficulty: string}[];
  userId?: string;
}

const ArchiveScreen: React.FC<ArchiveScreenProps> = ({ 
  onClose, 
  onSelectDate, 
  availablePuzzles, 
  userId 
}) => {
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
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayMonth: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
      };
    } catch (error) {
      return { dayOfWeek: 'Invalid', dayMonth: 'Date' };
    }
  };

  const handleDateSelect = (date: string) => {
    // Track archive puzzle selection
    trackArchivePuzzleLoad(date, true);
    console.log('🎯 [Archive] Date selected:', date);
    onSelectDate(date);
  };

  const isDateCompleted = (date: string) => completedDates.includes(date);

  return (
    <div className={`${styles.archiveScreen} ${styles.show}`}>
      <div className={styles.archiveContent}>
        <div className={styles.archiveHeader}>
          <button className={styles.archiveCloseX} onClick={onClose} type="button" aria-label="Close">
            <X size={24} />
          </button>
          
          <div className={styles.archiveTitle}>
            <Calendar size={24} />
            Archive Games
          </div>
          <div className={styles.archiveSubtitle}>Select a previous day to play</div>
        </div>
        
        <div className={styles.archiveContentBody}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Loading available puzzles...</p>
            </div>
          ) : availablePuzzles.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p className={styles.emptyText}>No archive puzzles available</p>
            </div>
          ) : (
            <div className={styles.archiveDates}>
              {/* Today's Game */}
              <button
                onClick={() => handleDateSelect(new Date().toISOString().split('T')[0])}
                className={`${styles.dateItem} ${styles.todayItem}`}
              >
                {isDateCompleted(new Date().toISOString().split('T')[0]) && (
                  <div className={styles.completionTick}>
                    <Check size={12} />
                  </div>
                )}
                <div className={styles.dateDay}>Today</div>
                <div className={styles.dateNumber}>
                  {(() => {
                    const today = new Date();
                    return today.toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short' 
                    });
                  })()}
                </div>
              </button>
              
              {availablePuzzles.map((puzzle) => {
                const { dayOfWeek, dayMonth } = formatDate(puzzle.date);
                const isCompleted = isDateCompleted(puzzle.date);
                const isToday = puzzle.date === new Date().toISOString().split('T')[0];
                
                // Skip today's puzzle since we show it separately
                if (isToday) return null;
                
                return (
                  <button
                    key={puzzle.date}
                    onClick={() => handleDateSelect(puzzle.date)}
                    className={styles.dateItem}
                  >
                    {isCompleted && (
                      <div className={styles.completionTick}>
                        <Check size={12} />
                      </div>
                    )}
                    <div className={styles.dateDay}>{dayOfWeek}</div>
                    <div className={styles.dateNumber}>{dayMonth}</div>
                  </button>
                );
              }).filter(Boolean)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchiveScreen;