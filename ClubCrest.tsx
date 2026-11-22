import React from 'react';
import { Club } from '../types/football';

interface ClubCrestProps {
  club: Pick<Club, 'code' | 'primaryColor' | 'secondaryColor' | 'crestStyle' | 'name'>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  xs: 20,
  sm: 28,
  md: 36,
  lg: 52,
  xl: 72,
};

export const ClubCrest: React.FC<ClubCrestProps> = ({
  club,
  size = 'md',
  className = '',
}) => {
  const px = SIZE_MAP[size];
  const uid = React.useId().replace(/:/g, '');
  const isLightPrimary =
    club.primaryColor.toUpperCase() === '#F8FAFC' ||
    club.primaryColor.toUpperCase() === '#F3F4F6' ||
    club.primaryColor.toUpperCase() === '#FDE100';

  const textColor = isLightPrimary ? '#0B0E14' : '#FFFFFF';
  const strokeColor = isLightPrimary ? 'rgba(15,23,42,0.28)' : 'rgba(255,255,255,0.22)';

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 40 40"
      fill="none"
      aria-label={`${club.name} crest`}
      className={`shrink-0 select-none ${className}`}
    >
      <defs>
        <clipPath id={`clip-${uid}`}>
          {club.crestStyle === 'circle' ? (
            <circle cx="20" cy="20" r="17" />
          ) : (
            <path d="M6 6.5C6 5.4 6.9 4.5 8 4.5H32C33.1 4.5 34 5.4 34 6.5V20.5C34 29.4 20 35.8 20 35.8C20 35.8 6 29.4 6 20.5V6.5Z" />
          )}
        </clipPath>
      </defs>

      <g clipPath={`url(#clip-${uid})`}>
        <rect x="0" y="0" width="40" height="40" fill={club.primaryColor} />
        {club.crestStyle === 'stripes' && (
          <>
            <rect x="10" y="0" width="6" height="40" fill={club.secondaryColor} fillOpacity="0.92" />
            <rect x="24" y="0" width="6" height="40" fill={club.secondaryColor} fillOpacity="0.92" />
          </>
        )}
        {club.crestStyle === 'diagonal' && (
          <polygon points="0,30 30,0 40,0 40,10 10,40 0,40" fill={club.secondaryColor} fillOpacity="0.9" />
        )}
        {club.crestStyle === 'chevron' && (
          <polygon points="4,15 20,27 36,15 36,22 20,34 4,22" fill={club.secondaryColor} fillOpacity="0.9" />
        )}
        {club.crestStyle === 'shield' && (
          <rect x="0" y="21" width="40" height="19" fill={club.secondaryColor} fillOpacity="0.24" />
        )}
        {club.crestStyle === 'circle' && (
          <circle
            cx="20"
            cy="20"
            r="13"
            stroke={club.secondaryColor}
            strokeWidth="2.5"
            strokeOpacity="0.85"
          />
        )}
        {/* Dark readability band for code */}
        <rect
          x="4"
          y="13.5"
          width="32"
          height="13"
          rx="2"
          fill={isLightPrimary ? 'rgba(255,255,255,0.88)' : 'rgba(7,8,10,0.72)'}
        />
      </g>

      {club.crestStyle === 'circle' ? (
        <circle cx="20" cy="20" r="17" stroke={strokeColor} strokeWidth="1.5" />
      ) : (
        <path
          d="M6 6.5C6 5.4 6.9 4.5 8 4.5H32C33.1 4.5 34 5.4 34 6.5V20.5C34 29.4 20 35.8 20 35.8C20 35.8 6 29.4 6 20.5V6.5Z"
          stroke={strokeColor}
          strokeWidth="1.5"
        />
      )}

      <text
        x="20"
        y="22.8"
        textAnchor="middle"
        fill={textColor}
        fontSize={club.code.length > 3 ? '7.5' : '9'}
        fontWeight="700"
        fontFamily="JetBrains Mono, monospace"
        letterSpacing="0.04em"
      >
        {club.code}
      </text>
    </svg>
  );
};
