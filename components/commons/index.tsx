import dynamic from 'next/dynamic';

export const components = {
  background: dynamic(() => import('./Background')),
  banner_video: dynamic(() => import('./BannerVideo')),
  button: dynamic(() => import('./button')),
  description: dynamic(() => import('./Description')),
  pagination: dynamic(() => import('./Pagination')),
  icon: dynamic(() => import('./Icon')),
  image: dynamic(() => import('./Image')),
  link: dynamic(() => import('./Link')),
  text: dynamic(() => import('./Text')),
  title_complex: dynamic(() => import('./titleComplex')),
  title_header: dynamic(() => import('./TitleHeader')),
  title_header_gradient: dynamic(() => import('./TitleHeaderGradient')),
  input_text: dynamic(() => import('./InputText')),
  default: dynamic(() => import('./Text')),
  navigation: dynamic(() => import('./Navigation')),
  dropdown: dynamic(() => import('./Dropdown')),
  collapse: dynamic(() => import('./collapse')),
};
