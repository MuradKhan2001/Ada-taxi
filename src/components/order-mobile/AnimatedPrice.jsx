import { useSpring, animated } from '@react-spring/web';
import { useEffect, useState } from 'react';
import {useTranslation} from "react-i18next";

function AnimatedPrice({ price }) {
    const {t} = useTranslation();
    const [prevPrice, setPrevPrice] = useState(price);

    const { number } = useSpring({
        from: { number: prevPrice },
        to: { number: price },
        config: { duration: 500 },
        onRest: () => setPrevPrice(price),
    });

    return (
        <animated.span>
            {number.to(n => `${Math.floor(n).toLocaleString('ru-RU')} ${t("sum")}`)}
        </animated.span>
    );
}


export default AnimatedPrice;