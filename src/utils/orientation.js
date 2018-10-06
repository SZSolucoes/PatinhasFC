import { Dimensions } from 'react-native';
 
export const msp = (dim, limit) => (
    (dim.scale * dim.width) >= limit || (dim.scale * dim.height) >= limit
);
 
export const isPortrait = () => {
    const dim = Dimensions.get('screen');
    return dim.height >= dim.width;
};
 
export const isLandscape = () => {
    const dim = Dimensions.get('screen');
    return dim.width >= dim.height;
};
 
export const isTablet = () => {
    const dim = Dimensions.get('screen');
    return ((dim.scale < 2 && msp(dim, 1000)) || (dim.scale >= 2 && msp(dim, 1900)));
};
 
export const isPhone = () => !isTablet();
 
