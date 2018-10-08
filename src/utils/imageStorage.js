
import _ from 'lodash';
import RNFetchBlob from 'rn-fetch-blob';

const images = [];

export const retrieveImgSource = (source) => {
    if (source && !!source.uri && !source.uri.slice(0, 5).includes('data')) {
        const index = _.findIndex(images, (item) => source.uri === item.url);
        if (index === -1) {
            const fs = RNFetchBlob.fs;
            let imagePath = null;
            let contentType = '';
            let imageLastIndex = 0;

            images.push({
                url: source.uri,
                uri: source.uri,
                contentType: ''
            });

            imageLastIndex = images.length;

            RNFetchBlob.config({
                fileCache: true
            })
            .fetch('GET', source.uri)
            .then(res => {
                imagePath = res.path();
                contentType = res.info().headers['content-type'];
                return res.readFile('base64');
            })
            .then(base64Data => {
                images[imageLastIndex - 1].uri = `data:${contentType};base64,${base64Data}`;
                images[imageLastIndex - 1].contentType = contentType;
                return fs.unlink(imagePath);
            })
            .catch(() => true);
            
            return source;
        } 
        
        return { uri: images[index].uri };
    } 
    
    return source;
};

