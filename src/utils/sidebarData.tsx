import { MdDashboard } from 'react-icons/md';
import { FiUserPlus } from 'react-icons/fi';
import { BsBoxes } from 'react-icons/bs';
import { BsBoxSeam } from 'react-icons/bs';
import { BiMessageAltError } from 'react-icons/bi';
import { TbReportAnalytics } from 'react-icons/tb';

export const navSupportsData = [
  { Icon: MdDashboard, title: 'Dashboard', details: [], note: '', path: '/dashboard' },
  { Icon: FiUserPlus, title: 'Clients', details: [], note: '', path: '/Clients' },
  { Icon: BsBoxSeam, title: 'Products', details: [], note: '', path: '/Products' },
  { Icon: BsBoxes, title: 'Packages', details: [], note: '', path: '/Packages' },
  { Icon: BiMessageAltError, title: 'Enquiry', details: [], note: '', path: '/Enquiry' },
  { Icon: TbReportAnalytics, title: 'Reports', details: [], note: '', path: '/Reports' },
];
