import dynamic from 'next/dynamic';

export const components = {
  background: dynamic(() => import('./background')),
  banner_video: dynamic(() => import('./bannerVideo')),
  button: dynamic(() => import('./button')),
  description: dynamic(() => import('./Description')),
  pagination: dynamic(() => import('./pagination')),
  icon: dynamic(() => import('./icon')),
  image: dynamic(() => import('./image')),
  link: dynamic(() => import('./link')),
  text: dynamic(() => import('./text')),
  title_complex: dynamic(() => import('./TitleComplex')),
  title_header: dynamic(() => import('./titleHeader')),
  title_header_gradient: dynamic(() => import('./TitleHeaderGradient')),
  input_text: dynamic(() => import('./inputText')),
  default: dynamic(() => import('./text')),
  navigation: dynamic(() => import('./Navigation')),
  dropdown: dynamic(() => import('./dropdown')),
};
