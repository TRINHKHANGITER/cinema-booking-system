import React from "react";
import Header from "./header"
import Footer from "./footer";


interface LayoutProps {
    children: React.ReactNode;
}

const DefaultLayout: React.FC<LayoutProps> = ({ children }) => {

    return (
        <div
            className="
                min-h-screen flex flex-col font-sans
                bg-background-light text-text-primary
                dark:bg-background-dark dark:text-text-inverse
            "
        >

            <Header />
            <main className="flex-grow flex flex-col">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default DefaultLayout;
