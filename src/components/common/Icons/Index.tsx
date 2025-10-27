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