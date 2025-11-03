interface IconProps {
  className?: string;
}

export const IconUpload = ({ className = "w-5 h-5" }: IconProps) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M7.76562 5.41654L9.89896 3.2832L12.0323 5.41654"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.89844 11.8168V3.3418"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.33203 10C3.33203 13.6833 5.83203 16.6667 9.9987 16.6667C14.1654 16.6667 16.6654 13.6833 16.6654 10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconPlus = ({ className = "w-5 h-5" }: IconProps) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M10.0013 4.16602V15.8327M4.16797 9.99935H15.8346"
      stroke="currentColor"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconTrash = ({ className = "w-4 h-4" }: IconProps) => (
  <svg
    width="17"
    height="19"
    viewBox="0 0 17 19"
    fill="none"
    className={className}
  >
    <path
      d="M0.832031 4.16732H2.4987M2.4987 4.16732H15.832M2.4987 4.16732V15.834C2.4987 16.276 2.67429 16.6999 2.98685 17.0125C3.29941 17.3251 3.72334 17.5007 4.16536 17.5007H12.4987C12.9407 17.5007 13.3646 17.3251 13.6772 17.0125C13.9898 16.6999 14.1654 16.276 14.1654 15.834V4.16732H2.4987ZM4.9987 4.16732V2.50065C4.9987 2.05862 5.17429 1.6347 5.48685 1.32214C5.79941 1.00958 6.22334 0.833984 6.66536 0.833984H9.9987C10.4407 0.833984 10.8646 1.00958 11.1772 1.32214C11.4898 1.6347 11.6654 2.05862 11.6654 2.50065V4.16732M6.66536 8.33398V13.334M9.9987 8.33398V13.334"
      stroke="currentColor"
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconPencil = ({ className = "w-4 h-4" }: IconProps) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <g clipPath="url(#clip0_857_1938)">
      <path
        d="M14.168 2.5009C14.3868 2.28203 14.6467 2.10842 14.9326 1.98996C15.2186 1.87151 15.5251 1.81055 15.8346 1.81055C16.1442 1.81055 16.4507 1.87151 16.7366 1.98996C17.0226 2.10842 17.2824 2.28203 17.5013 2.5009C17.7202 2.71977 17.8938 2.97961 18.0122 3.26558C18.1307 3.55154 18.1917 3.85804 18.1917 4.16757C18.1917 4.4771 18.1307 4.7836 18.0122 5.06956C17.8938 5.35553 17.7202 5.61537 17.5013 5.83424L6.2513 17.0842L1.66797 18.3342L2.91797 13.7509L14.168 2.5009Z"
        stroke="currentColor"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_857_1938">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const IconFilter = ({ className = "w-5 h-5" }: IconProps) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M5 10H15M2.5 5H17.5M7.5 15H12.5"
      stroke="currentColor"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconSortDown = ({ className = "w-3 h-3" }: IconProps) => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 11 11"
    fill="none"
    className={className}
  >
    <path
      d="M5.33464 0.666016V9.99935M5.33464 9.99935L10.0013 5.33268M5.33464 9.99935L0.667969 5.33268"
      stroke="currentColor"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconCheckboxEmpty = ({ className = "w-4 h-4" }: IconProps) => (
  <svg
    width="9"
    height="10"
    viewBox="0 0 9 10"
    fill="none"
    className={className}
  >
    <rect
      x="0.5"
      y="0.5"
      width="8"
      height="8.95636"
      rx="1.5"
      stroke="currentColor"
    />
  </svg>
);

export const IconCheckboxChecked = ({ className = "w-4 h-4" }: IconProps) => (
  <svg
    width="9"
    height="10"
    viewBox="0 0 9 10"
    fill="none"
    className={className}
  >
    <rect
      x="0.5"
      y="0.5"
      width="8"
      height="8.95636"
      rx="1.5"
      fill="#043428"
      stroke="#043428"
    />
    <path
      d="M2.5 5L4 6.5L6.5 3.5"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const IconLogout = ({ className = "w-4 h-4" }: IconProps) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M11.625 9.74732L13.3317 8.04065L11.625 6.33398"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.50781 8.03906H13.2878"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.84115 13.3327C4.89448 13.3327 2.50781 11.3327 2.50781 7.99935C2.50781 4.66602 4.89448 2.66602 7.84115 2.66602"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconArrowLeft = ({ className = "w-4 h-4" }: IconProps) => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 19 19"
    fill="none"
    className={className}
  >
    <path
      d="M7.57495 4.69434L2.76953 9.49975L7.57495 14.3052"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.23 9.5H2.90625"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
