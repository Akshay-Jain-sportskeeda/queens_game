import React, { useEffect } from 'react';

export const RaptiveOutstreamAd: React.FC = () => {
  return (
    <div className="raptive-pfn-outstream">
      {/* Raptive will inject the outstream player here */}
    </div>
  );
};

export const RaptiveSidebarAd: React.FC = () => {
  return (
    <div className="raptive-pfn-sticky-sidebar">
      {/* Raptive will inject the sidebar ad here */}
    </div>
  );
};

export const RaptiveFooterAd: React.FC = () => {
  return (
    <div className="raptive-pfn-disable-footer-close">
      {/* Raptive will inject the footer ad here */}
    </div>
  );
};

// Component to trigger ad refresh if needed
export const useRaptiveRefresh = () => {
  useEffect(() => {
    // Trigger Raptive/AdThrive ad refresh if their API is available
    if (window.adthrive && window.adthrive.cmd) {
      window.adthrive.cmd.push(function() {
        window.adthrive.refresh();
      });
    }
  }, []);
};