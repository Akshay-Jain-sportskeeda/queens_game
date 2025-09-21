import React, { useEffect } from "react";

export const RaptiveOutstreamAd: React.FC = () => (
  <div className="raptive-pfn-outstream" />
);

export const RaptiveSidebarAd: React.FC = () => (
  <div className="raptive-pfn-sticky-sidebar" />
);

export const RaptiveFooterAd: React.FC = () => (
  <div className="raptive-pfn-disable-footer-close" />
);

export const useRaptiveRefresh = () => {
  useEffect(() => {
    if (window.adthrive?.cmd) {
      window.adthrive.cmd.push(() => {
        window.adthrive?.refresh?.();
      });
    }
  }, []);
};
