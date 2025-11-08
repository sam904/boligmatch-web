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

export const IconKey = ({ className = "w-5 h-5" }: IconProps) => (
  <svg
    width="25"
    height="24"
    viewBox="0 0 25 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.9232 0.835938L20.5898 3.16927M20.5898 3.16927L24.0898 6.66927L20.0065 10.7526L16.5065 7.2526M20.5898 3.16927L16.5065 7.2526M11.7115 12.0476C12.3139 12.642 12.7928 13.3496 13.1206 14.1299C13.4483 14.9101 13.6185 15.7474 13.6214 16.5937C13.6242 17.4399 13.4596 18.2784 13.1371 19.0608C12.8145 19.8432 12.3404 20.554 11.742 21.1524C11.1436 21.7508 10.4327 22.225 9.65036 22.5475C8.86797 22.87 8.0295 23.0346 7.18324 23.0318C6.33698 23.029 5.49964 22.8588 4.71943 22.531C3.93922 22.2032 3.23155 21.7243 2.63717 21.1219C1.46832 19.9117 0.82156 18.2909 0.83618 16.6084C0.8508 14.926 1.52563 13.3166 2.71534 12.1269C3.90504 10.9372 5.51442 10.2624 7.19685 10.2478C8.87928 10.2332 10.5001 10.8799 11.7103 12.0488L11.7115 12.0476ZM11.7115 12.0476L16.5065 7.2526"
      stroke="currentColor"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconEye = ({ className = "w-5 h-5" }: IconProps) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M2.0166 10.5943C1.90352 10.4142 1.84698 10.3242 1.80653 10.186C1.77917 10.0914 1.76201 9.94213 1.76201 9.84372C1.76201 9.74531 1.77917 9.59602 1.80653 9.50142C1.84698 9.36319 1.90352 9.27321 2.0166 9.09326C2.77234 7.85977 5.4666 4.16602 9.99993 4.16602C14.5333 4.16602 17.2275 7.85977 17.9833 9.09326C18.0964 9.27321 18.1529 9.36319 18.1934 9.50142C18.2207 9.59602 18.2379 9.74531 18.2379 9.84372C18.2379 9.94213 18.2207 10.0914 18.1934 10.186C18.1529 10.3242 18.0964 10.4142 17.9833 10.5943C17.2275 11.8278 14.5333 15.521 9.99993 15.521C5.4666 15.521 2.77234 11.8278 2.0166 10.5943Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.99993 12.4993C11.3806 12.4993 12.4999 11.38 12.4999 9.99935C12.4999 8.61864 11.3806 7.49935 9.99993 7.49935C8.61922 7.49935 7.49993 8.61864 7.49993 9.99935C7.49993 11.38 8.61922 12.4993 9.99993 12.4993Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconEyeOff = ({ className = "w-5 h-5" }: IconProps) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M8.63331 4.36602C9.06069 4.25651 9.50496 4.20133 9.95117 4.20215C14.4845 4.20215 17.1788 7.8959 17.9345 9.12939C18.0476 9.30934 18.1041 9.39932 18.1446 9.53755C18.1719 9.63215 18.1891 9.78144 18.1891 9.87985C18.1891 9.97826 18.1719 10.1275 18.1446 10.2221C18.1041 10.3604 18.0476 10.4504 17.9345 10.6303C17.6118 11.1459 17.0595 11.936 16.3333 12.7022M5.18117 5.18115C3.60083 6.29415 2.41117 7.8339 1.96945 9.09326C1.85637 9.27321 1.79983 9.36319 1.75938 9.50142C1.73202 9.59602 1.71486 9.74531 1.71486 9.84372C1.71486 9.94213 1.73202 10.0914 1.75938 10.186C1.79983 10.3242 1.85637 10.4142 1.96945 10.5943C2.72519 11.8278 5.41945 15.521 9.95278 15.521C11.5712 15.521 13.0062 14.9833 14.1667 14.1667L5.18117 5.18115Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.63331 4.36602C9.06069 4.25651 9.50496 4.20133 9.95117 4.20215C14.4845 4.20215 17.1788 7.8959 17.9345 9.12939C18.0476 9.30934 18.1041 9.39932 18.1446 9.53755C18.1719 9.63215 18.1891 9.78144 18.1891 9.87985C18.1891 9.97826 18.1719 10.1275 18.1446 10.2221C18.1041 10.3604 18.0476 10.4504 17.9345 10.6303C17.6118 11.1459 17.0595 11.936 16.3333 12.7022M5.18117 5.18115C3.60083 6.29415 2.41117 7.8339 1.96945 9.09326C1.85637 9.27321 1.79983 9.36319 1.75938 9.50142C1.73202 9.59602 1.71486 9.74531 1.71486 9.84372C1.71486 9.94213 1.73202 10.0914 1.75938 10.186C1.79983 10.3242 1.85637 10.4142 1.96945 10.5943C2.72519 11.8278 5.41945 15.521 9.95278 15.521C11.5712 15.521 13.0062 14.9833 14.1667 14.1667L5.18117 5.18115Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.49988 2.5L17.4999 17.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconNoRecords = ({ className = "w-16 h-16" }: IconProps) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);