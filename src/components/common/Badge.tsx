import React from 'react';
import type { ReferralStatus } from '../../types';

interface BadgeProps {
  status: ReferralStatus | 'ROUTINE' | 'URGENT' | 'EMERGENCY';
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const getBadgeClassAndText = () => {
    switch (status) {
      case 'PENDING_ADMIN':
        return { className: 'badge badge-pending', text: 'Pending Admin Review' };
      case 'INFO_REQUESTED':
        return { className: 'badge badge-info-requested', text: 'Info Requested' };
      case 'REJECTED':
        return { className: 'badge badge-rejected', text: 'Rejected' };
      case 'APPROVED_FORWARDED':
        return { className: 'badge badge-approved', text: 'Approved & Forwarded' };
      case 'ACCEPTED':
        return { className: 'badge badge-accepted', text: 'Accepted / In-Progress' };
      case 'TREATMENT_COMPLETED':
        return { className: 'badge badge-completed', text: 'Treatment Completed' };
      case 'EMERGENCY':
        return { className: 'badge badge-urgency-emergency', text: 'Emergency' };
      case 'URGENT':
        return { className: 'badge badge-urgency-urgent', text: 'Urgent' };
      case 'ROUTINE':
        return { className: 'badge badge-urgency-routine', text: 'Routine' };
      default:
        return { className: 'badge', text: status };
    }
  };

  const { className, text } = getBadgeClassAndText();

  return <span className={className}>{text}</span>;
};
