import logo from '../../../public/images/logoImage.png';

type LogoIconProps = {
    className?: string;
};

function LogoIcon({ className }: LogoIconProps) {
    return ( 
        <img
            src={logo}
            alt="Galaxy Cinema logo"
            className={className ?? "h-24 w-24 object-contain"}
        />
     );
}

export default LogoIcon;
