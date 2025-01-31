import "./loader.scss";
import Lottie from 'react-lottie';
import animationData from './lotties/Buyuk.mp4.lottie';

const Loader = () => {

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    };

    return <>
        <div className="spinner-container">
            {/*<Lottie*/}
            {/*    options={defaultOptions}*/}
            {/*    height={400}*/}
            {/*    width={400}*/}
            {/*/>*/}
            <div className="loader"></div>
        </div>
    </>
};

export default Loader;