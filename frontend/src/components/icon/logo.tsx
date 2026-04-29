type LogoIconProps = {
    className?: string;
};

function LogoIcon({ className }: LogoIconProps) {
    return ( 
        <img
            src="/images/logoImage.png"
            alt="Galaxy Cinema logo"
            className={className ?? "h-24 w-24 object-contain"}
        />
     );
}

export default LogoIcon;
