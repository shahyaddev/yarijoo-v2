import Link from 'next/link';
import React from 'react';

const BreadCrumb = ({ children, link, active }) => {
  return (
    <div className='min-w-fit flex items-center text-secondaryTextColor text-sm gap-2'>
      {link ? <Link href={link} className='block min-w-fit'>{children}</Link> : <span className="font-semibold text-primaryTextColor">{children}</span>}

      {!active && <i className="fi fi-br-angle-left text-xs h-[12px]"></i>}
    </div>
  );
}

export default BreadCrumb;
