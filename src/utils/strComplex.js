
export const limitDotText = (text, maxSize) => (
    text.length > maxSize ? `${text.substring(0, maxSize - 3)}...` : text
);

export const formattedSeconds = (sec) => `${Math.floor(sec / 60)}:${(`0${sec % 60}`).slice(-2)}`;

export const formatJogoSeconds = (sec) => {
    const seconds = typeof sec === 'string' ? parseInt(sec, 10) : sec;
    let minutes = Math.floor(seconds / 60);
    let strRet = '';
    let diff = 0;

    if (minutes > 90) {
        diff = minutes - 90;
        minutes = 90;
    } 
    
    if (minutes === 0) {
        minutes = 1;
    }

    if (diff !== 0) {
        strRet = [`${minutes}'`, `+${diff}  `];
    } else {
        strRet = [`${minutes}'  `];
    }

    return strRet;
};

